// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MarketplaceEscrow {
    address public platform;
    uint256 public platformPercent; // e.g. 5 for 5%

    event PaymentSplit(address indexed buyer, address indexed seller, uint256 platformAmount, uint256 sellerAmount);

    constructor(address _platform, uint256 _platformPercent) {
        require(_platformPercent < 100, "Invalid percent");
        platform = _platform;
        platformPercent = _platformPercent;
    }

    function buy(address seller) external payable {
        require(msg.value > 0, "No ETH sent");
        require(seller != address(0), "Invalid seller");

        uint256 platformAmount = (msg.value * platformPercent) / 100;
        uint256 sellerAmount = msg.value - platformAmount;

        // Transfer platform fee
        (bool sentPlatform, ) = platform.call{value: platformAmount}("");
        require(sentPlatform, "Platform transfer failed");

        // Transfer seller amount
        (bool sentSeller, ) = seller.call{value: sellerAmount}("");
        require(sentSeller, "Seller transfer failed");

        emit PaymentSplit(msg.sender, seller, platformAmount, sellerAmount);
    }
}