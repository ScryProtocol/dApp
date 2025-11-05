// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
interface IERC20 {
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

library SafeERC20 {
    using SafeERC20 for IERC20;

    function safeTransferFrom(
        IERC20 token,
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        require(
            token.transferFrom(sender, recipient, amount),
            "SafeERC20: transferFrom failed"
        );
    }
}

contract slice {
    using SafeERC20 for IERC20;
    struct StreamDetails {
        address lender;
        address friend;
        address token;
        uint256 totalStreamed;
        uint256 outstanding;
        uint256 allowable;
        uint256 window;
        uint256 timestamp;
        bool once;
    }

    mapping(bytes32 => StreamDetails) public streamDetails;
    mapping(address => bytes32[]) public streamDetailsByLender;
    mapping(address => bytes32[]) public streamDetailsByFriend;
    address payable public feeAddress;
    uint public fee;
    event StreamAllowed(
        address indexed lender,
        address indexed token,
        address indexed friend,
        uint256 amount
    );
    event Streamed(
        address indexed token,
        address indexed lender,
        address indexed streamer,
        uint256 amount
    );

    constructor(address payable feeAddrs) {
        feeAddress = feeAddrs;
    }

    function computeHash(
        address lender,
        address token,
        address friend
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(lender, token, friend));
    }

    function allowStream(
        address token,
        address friend,
        uint256 amount,
        uint256 window,
        bool once
    ) external {
        bytes32 hash = computeHash(msg.sender, token, friend);
        if (streamDetails[hash].lender == address(0)) {
            streamDetails[hash] = StreamDetails({
                lender: msg.sender,
                friend: friend,
                token: token,
                totalStreamed: 0,
                outstanding: amount,
                allowable: amount,
                window: window,
                timestamp: block.timestamp,
                once: once
            });
            streamDetailsByLender[msg.sender].push(hash);
            streamDetailsByFriend[friend].push(hash);
        } else {
            streamDetails[hash].allowable = amount;
            streamDetails[hash].outstanding = amount;
            streamDetails[hash].window = window;
            streamDetails[hash].timestamp = block.timestamp;
            streamDetails[hash].once = once;
        }
        emit StreamAllowed(msg.sender, token, friend, amount);
    }

    function stream(address token, address lender, address me) external {
        bytes32 hash = computeHash(lender, token, me);
        StreamDetails storage details = streamDetails[hash];
        require(details.lender != address(0), "Stream does not exist");

        uint256 currentTime = block.timestamp;
        uint256 elapsedTime = currentTime - details.timestamp;
        uint256 allowableAmount = (details.allowable * elapsedTime) /
            details.window;

        if (allowableAmount > details.outstanding && details.once == true) {
            allowableAmount = details.outstanding;
        }

        if (elapsedTime<1){//details.once == 2) {
            details.outstanding +=
                (elapsedTime / details.window) *
                allowableAmount;
            if (details.outstanding > details.allowable)
                details.outstanding = details.allowable;
            allowableAmount = details.outstanding;
        }
        
        require(allowableAmount > 0, "No allowable amount to withdraw");
        if (details.once) {
            details.outstanding -= allowableAmount;
        }
        details.totalStreamed += allowableAmount;
        details.timestamp = currentTime;
        IERC20(token).safeTransferFrom(lender, me, allowableAmount);
        if (fee > 0) {
            uint256 feeAmount = (allowableAmount * fee) / 1000;
            IERC20(token).safeTransferFrom(lender, feeAddress, feeAmount);
        }
        emit Streamed(token, lender, me, allowableAmount);
    }

    function getAvailable(
        address token,
        address lender,
        address me
    ) external view returns (uint256) {
        bytes32 hash = computeHash(lender, token, me);
        StreamDetails storage details = streamDetails[hash];
        require(details.lender != address(0), "Stream does not exist");

        uint256 currentTime = block.timestamp;
        uint256 elapsedTime = currentTime - details.timestamp;
        uint256 allowableAmount = (details.allowable * elapsedTime) /
            details.window;

        if (allowableAmount > details.outstanding && details.once == true) {
            allowableAmount = details.outstanding;
        }

        return allowableAmount;
    }

    function viewLenderAllowances(
        address lender
    ) public view returns (bytes32[] memory) {
        return streamDetailsByLender[lender];
    }

    function viewFriendAllowances(
        address friend
    ) public view returns (bytes32[] memory) {
        return streamDetailsByFriend[friend];
    }
    function setFee(uint _fee, address newfeeAddress) public {
        require(msg.sender == feeAddress, "You are not the owner");
        fee = _fee <= 50 ? _fee : 50;
        newfeeAddress != address(0)
            ? feeAddress = payable(newfeeAddress)
            : feeAddress = feeAddress;
    }
}
