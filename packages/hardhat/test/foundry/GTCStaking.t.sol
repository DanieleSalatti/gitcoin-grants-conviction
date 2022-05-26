pragma solidity ^0.8.10;
//SPDX-License-Identifier: MIT

import "../../contracts/GTCStaking.sol";
import "../../contracts/GTC.sol";
import "forge-std/Test.sol";


/// @author: DanieleSalatti
/// @Description: For more details see https://book.getfoundry.sh/

/// @dev This is a test contract that uses the `Foundry` library.   It is a
/// @dev To test, install Foundry and run forge test -vvvvv in the root directory.
contract testing is Test {

    /// @dev Declaring the imported contracts as a variable
    GTCStaking gtcStaking;
    GTC gtcToken;

    /// @notice setUp function in Foundry is like a beforeEach function used in Hardhat!
    /// @dev This function is called before each test.
    function setUp() public {
        vm.warp(50);
        /// @notice: Instatntiating the imported contract
        gtcToken = new GTC();
        gtcStaking = new GTCStaking(address(gtcToken));
        gtcToken.mint(address(1), 100 ether);
    }

    /// @dev Testing the currentTimestamp function.
    /// @dev To view indepth details of the test traces. Use forge test -vvvvv
    function testCurrentTimestamp() public {
        vm.warp(100);
        /// @notice: Console log to view the output
        console.log(gtcStaking.currentTimestamp());

        /// @notice: Asserting the output using DsTest Cheatcode.
        assertEq(gtcStaking.currentTimestamp(), 100);
    }

    /// @dev Testing the vote function.
    /// @dev To view indepth details of the test traces. Use forge test -vvvvv
    function testVote() public {
        vm.startPrank(address(1));
        gtcToken.approve(address(gtcStaking), 40 ether);

        // define the vote params
        GTCStaking.BatchVoteParam[] memory params = new GTCStaking.BatchVoteParam[](3);
        params[0] = GTCStaking.BatchVoteParam(1, 10 ether);
        params[1] = GTCStaking.BatchVoteParam(2, 15 ether);
        params[2] = GTCStaking.BatchVoteParam(3, 15 ether);

        gtcStaking.vote(params);

        // assertion checks
        (
            bool released,
            address voter,
            uint256 amount,
            uint256 grantId,
            uint256 voteId
        ) = gtcStaking.votes(0);

        assert(!released);
        assertEq(voteId, 0);
        assertEq(voter, address(1));
        assertEq(grantId, 1);
        assertEq(amount, 10 ether);

        (released, voter, amount, grantId, voteId) = gtcStaking.votes(1);

        assert(!released);
        assertEq(voteId, 1);
        assertEq(voter, address(1));
        assertEq(grantId, 2);
        assertEq(amount, 15 ether);
    }

    /// @dev Testing the releaseTokens function.
    /// @dev To view indepth details of the test traces. Use forge test -vvvvv
    function testReleaseTokens() public {
        vm.startPrank(address(1));
        gtcToken.approve(address(gtcStaking), 30 ether);

        // define the vote params
        GTCStaking.BatchVoteParam[] memory params = new GTCStaking.BatchVoteParam[](2);
        params[0] = GTCStaking.BatchVoteParam(1, 10 ether);
        params[1] = GTCStaking.BatchVoteParam(2, 15 ether);

        gtcStaking.vote(params);

        uint256[] memory voteIds = new uint256[](2);
        voteIds[0] = 0;
        voteIds[1] = 1;

        vm.stopPrank();

        // using non-owner as msg.sender
        vm.startPrank(address(2));
        vm.expectRevert(abi.encodeWithSignature('NOT_OWNER()'));
        gtcStaking.releaseTokens(voteIds);

        // updating msg.sender to correct address
        vm.stopPrank();
        vm.startPrank(address(1));

        uint256 balance = gtcToken.balanceOf(address(1));

        gtcStaking.releaseTokens(voteIds);

        // balance checks
        assertEq(balance + 25 ether, gtcToken.balanceOf(address(1)));

        // calling releaseTokens again does not revert
        gtcStaking.releaseTokens(voteIds);
    }
}
