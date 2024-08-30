// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SubscriptionPlatform {
    struct Creator {
        address payable creatorAddress;
        uint256 subscriptionFee;
        uint256 subscriberCount;
    }

    struct Subscriber {
        uint256 subscriptionEnd;
        bool isActive;
    }

    mapping(address => Creator) public creators;
    mapping(address => mapping(address => Subscriber)) public subscriptions;

    event CreatorRegistered(address creator, uint256 subscriptionFee);
    event NewSubscription(address subscriber, address creator, uint256 endDate);
    event SubscriptionRenewed(address subscriber, address creator, uint256 newEndDate);

    function registerCreator(uint256 _subscriptionFee) external {
        require(creators[msg.sender].creatorAddress == address(0), "Creator already registered");
        creators[msg.sender] = Creator(payable(msg.sender), _subscriptionFee, 0);
        emit CreatorRegistered(msg.sender, _subscriptionFee);
    }

    function subscribe(address _creator) external payable {
        Creator storage creator = creators[_creator];
        require(creator.creatorAddress != address(0), "Creator not found");
        require(msg.value >= creator.subscriptionFee, "Insufficient payment");

        uint256 subscriptionEnd = block.timestamp + 30 days;
        subscriptions[msg.sender][_creator] = Subscriber(subscriptionEnd, true);
        creator.subscriberCount++;

        creator.creatorAddress.transfer(msg.value);
        emit NewSubscription(msg.sender, _creator, subscriptionEnd);
    }

    function renewSubscription(address _creator) external payable {
        Creator storage creator = creators[_creator];
        Subscriber storage subscription = subscriptions[msg.sender][_creator];
        require(creator.creatorAddress != address(0), "Creator not found");
        require(subscription.isActive, "No active subscription");
        require(msg.value >= creator.subscriptionFee, "Insufficient payment");

        subscription.subscriptionEnd += 30 days;
        creator.creatorAddress.transfer(msg.value);
        emit SubscriptionRenewed(msg.sender, _creator, subscription.subscriptionEnd);
    }

    function checkSubscription(address _subscriber, address _creator) external view returns (bool) {
        return subscriptions[_subscriber][_creator].subscriptionEnd > block.timestamp;
    }
}