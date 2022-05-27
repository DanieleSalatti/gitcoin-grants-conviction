import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  GTCStaking,
  VoteCasted,
  TokensReleased,
  ConstructorCall__Outputs,
} from "../generated/GTCStaking/GTCStaking";
import {
  Vote,
  Voter,
  Release,
  RunningVoteRecord,
  Grant,
} from "../generated/schema";
import { log } from "@graphprotocol/graph-ts";

export function handleVoteCasted(event: VoteCasted): void {
  let voterString = event.params.voter.toHexString();

  let voter = Voter.load(voterString);

  let grant = Grant.load(event.params.grantId.toHexString());

  if (grant == null) {
    grant = new Grant(event.params.grantId.toHexString());
    grant.votes = [];
    grant.releases = [];
  }

  if (voter === null) {
    voter = new Voter(voterString);
    voter.address = event.params.voter;
    voter.createdAt = event.block.timestamp;
    voter.voteCount = BigInt.fromI32(1);
    voter.totalStaked = event.params.amount;
  } else {
    voter.voteCount = voter.voteCount.plus(BigInt.fromI32(1));
    voter.totalStaked = voter.totalStaked.plus(event.params.amount);
  }

  let vote = new Vote(event.params.voteId.toHexString());

  vote.voter = voter.id;
  vote.amount = event.params.amount;
  vote.grantId = event.params.grantId;
  vote.createdAt = event.block.timestamp;
  vote.transactionHash = event.transaction.hash.toHex();

  let votesForGrant = grant.votes;
  votesForGrant.push(vote.id);
  grant.votes = votesForGrant;

  let runningVoteRecord = RunningVoteRecord.load(
    voter.id + "-" + vote.grantId.toHexString()
  );

  if (runningVoteRecord === null) {
    runningVoteRecord = new RunningVoteRecord(
      voter.id + "-" + vote.grantId.toHexString()
    );
    runningVoteRecord.createdAt = event.block.timestamp;
    runningVoteRecord.updatedAt = event.block.timestamp;
    runningVoteRecord.initialTransactionHash = event.transaction.hash.toHex();
    runningVoteRecord.latestTransactionHash = event.transaction.hash.toHex();
    runningVoteRecord.voter = voter.id;
    runningVoteRecord.votes = [vote.id];
    runningVoteRecord.releases = [];
    runningVoteRecord.grantId = vote.grantId;
    runningVoteRecord.voteCount = BigInt.fromI32(1);
    runningVoteRecord.totalStaked = event.params.amount;
  } else {
    runningVoteRecord.updatedAt = event.block.timestamp;
    runningVoteRecord.latestTransactionHash = event.transaction.hash.toHex();
    runningVoteRecord.voteCount = runningVoteRecord.voteCount.plus(
      BigInt.fromI32(1)
    );
    runningVoteRecord.totalStaked = runningVoteRecord.totalStaked.plus(
      event.params.amount
    );
    // This does not work: runningVoteRecord.votes.push(vote.id);
    let votes = runningVoteRecord.votes;
    votes.push(vote.id);
    runningVoteRecord.votes = votes;
  }

  voter.save();
  vote.save();
  runningVoteRecord.save();
  grant.save();
}

export function handleTokensReleased(event: TokensReleased): void {
  let voterString = event.params.voter.toHexString();

  let voter = Voter.load(voterString);

  if (voter === null) {
    log.error("🚨 Voter not found: {}", [voterString]);
    return;
  }

  let vote = Vote.load(event.params.voteId.toHexString());

  if (vote === null) {
    log.error("🚨 Vote not found: {}", [event.params.voteId.toHexString()]);
    return;
  }

  let grant = Grant.load(vote.grantId.toHexString());

  if (grant == null) {
    log.error("🚨 Grant not found: {}", [vote.grantId.toHexString()]);
    return;
  }

  let release = new Release(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );

  release.voteId = event.params.voteId;
  release.grantId = event.params.grantId;
  release.voter = voter.id;
  release.amount = event.params.amount;
  release.createdAt = event.block.timestamp;
  release.transactionHash = event.transaction.hash.toHex();

  let releasesForGrant = grant.releases;
  releasesForGrant.push(release.id);
  grant.releases = releasesForGrant;

  let runningVoteRecord = RunningVoteRecord.load(
    voter.id + "-" + vote.grantId.toHexString()
  );

  if (runningVoteRecord === null) {
    log.error("🚨 RunningVoteRecord not found: {}-{}", [
      voter.id,
      vote.grantId.toHexString(),
    ]);
    return;
  }

  runningVoteRecord.updatedAt = event.block.timestamp;
  runningVoteRecord.latestTransactionHash = event.transaction.hash.toHex();
  runningVoteRecord.totalStaked = runningVoteRecord.totalStaked.minus(
    event.params.amount
  );
  let releasesForRunningVoteRecord = runningVoteRecord.releases;
  releasesForRunningVoteRecord.push(release.id);
  runningVoteRecord.releases = releasesForRunningVoteRecord;

  release.save();
  runningVoteRecord.save();
  grant.save();
}
