pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//*********************************************************************//
// --------------------------- custom errors ------------------------- //
//*********************************************************************//
error INVALID_AMOUNT();
error NOT_OWNER();
error TOKENS_ALREADY_RELAEASED();

/**
@title GTCStaking Contract
@notice Vote on gitcoin grants powered by conviction voting off-chain by staking your gtc.
*/
contract GTCStaking {
    event VoteCasted(
        uint56 voteId,
        address voter,
        uint152 amount,
        uint48 grantId
    );

    event TokensReleased(uint56 voteId, address voter, uint152 amount);

    /// @notice gtc token contract instance.
    IERC20 immutable public gtcToken;

    /// @notice vote struct array.
    Vote[] public votes;

    /// @notice mapping which tracks the votes for a particular user.
    mapping(address => uint56[]) public voterToVoteIds;

    /// @notice Vote struct.
    struct Vote {
        bool released;
        address voter;
        uint152 amount;
        uint48 grantId;
        uint56 voteId;
    }

    /// @notice BatchVote struct.
    struct BatchVoteParam {
        uint48 grantId;
        uint152 amount;
    }

    /**
    @dev Constructor.
    @param tokenAddress gtc token address.
    */
    constructor(address tokenAddress) {
        gtcToken = IERC20(tokenAddress);
    }

    /**
    @dev Get Current Timestamp.
    @return current timestamp.
    */
    function currentTimestamp() external view returns (uint256) {
        return block.timestamp;
    }

    /**
    @dev Checks if tokens are locked or not.
    @return status of the tokens.
    */
    function areTokensLocked(uint56 _voteId) external view returns (bool) {
        return !votes[_voteId].released;
    }

    /**
    @dev Vote Info for a user.
    @param _voter address of voter
    @return Vote struct for the particular user id.
    */
    function getVotesForAddress(address _voter)
        external
        view
        returns (Vote[] memory)
    {
        uint56[] memory voteIds = voterToVoteIds[_voter];
        Vote[] memory votesForAddress = new Vote[](voteIds.length);
        for (uint256 i = 0; i < voteIds.length; i++) {
            votesForAddress[i] = votes[voteIds[i]];
        }
        return votesForAddress;
    }

    /**
    @dev Stake and get Voting rights.
    @param _grantId gitcoin grant id.
    @param _amount amount of tokens to lock.
    */
    function _vote(uint48 _grantId, uint152 _amount) internal {
        if (_amount == 0) {
            revert INVALID_AMOUNT();
        }

        gtcToken.transferFrom(msg.sender, address(this), _amount);

        uint56 voteId = uint56(votes.length);

        votes.push(
            Vote({
                voteId: voteId,
                voter: msg.sender,
                amount: _amount,
                grantId: _grantId,
                released: false
            })
        );

        voterToVoteIds[msg.sender].push(voteId);

        emit VoteCasted(voteId, msg.sender, _amount, _grantId);
    }

    /**
    @dev Stake and get Voting rights in barch.
    @param _batch array of struct to stake into multiple grants.
    */
    function vote(BatchVoteParam[] memory _batch) external {
        for (uint256 i = 0; i < _batch.length; i++) {
            _vote(_batch[i].grantId, _batch[i].amount);
        }
    }

    /**
    @dev Release tokens and give up votes.
    @param _voteIds array of vote ids in order to release tokens.
    */
    function releaseTokens(uint256[] memory _voteIds) external {
        for (uint256 i = 0; i < _voteIds.length; i++) {
            if (votes[_voteIds[i]].voter != msg.sender) {
                revert NOT_OWNER();
            }
            if (votes[_voteIds[i]].released) {
                // UI can send the same vote multiple times, ignore it
                continue;
            }
            votes[_voteIds[i]].released = true;
            gtcToken.transfer(msg.sender, votes[_voteIds[i]].amount);

            emit TokensReleased(uint56(_voteIds[i]), msg.sender, votes[_voteIds[i]].amount);
        }
    }
}
