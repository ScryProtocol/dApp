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

contract spot {
    using SafeERC20 for IERC20;
    struct BorrowDetails {
        address lender;
        address friend;
        address token;
        uint256 totalBorrowed;
        uint256 outstanding;
        uint256 allowable;
    }

    mapping(bytes32 => BorrowDetails) public borrowDetails;
    mapping(address => bytes32[]) public borrowDetailsByLender;
    mapping(address => bytes32[]) public borrowDetailsByFriend;
    address payable public feeAddress;
    uint public fee;
    event BorrowAllowed(
        address indexed lender,
        address indexed token,
        address indexed friend,
        uint256 amount
    );
    event Borrowed(
        address indexed token,
        address indexed lender,
        address indexed borrower,
        uint256 amount
    );
    event Repaid(
        address indexed token,
        address indexed lender,
        address indexed borrower,
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

    function allowBorrow(
        address token,
        address friend,
        uint256 amount
    ) external {
        bytes32 hash = computeHash(msg.sender, token, friend);
        if (borrowDetails[hash].lender == address(0)) {
            borrowDetails[hash] = BorrowDetails({
                lender: msg.sender,
                friend: friend,
                token: token,
                totalBorrowed: 0,
                outstanding: 0,
                allowable: amount
            });
            borrowDetailsByLender[msg.sender].push(hash);
            borrowDetailsByFriend[friend].push(hash);
        } else {
            borrowDetails[hash].allowable = amount;
        }
        emit BorrowAllowed(msg.sender, token, friend, amount);
    }

    function borrow(address token, address lender, uint256 amount) external {
        bytes32 hash = computeHash(lender, token, msg.sender);
        require(
            borrowDetails[hash].allowable - borrowDetails[hash].outstanding >=
                amount,
            "Not enough allowable amount"
        );
        require(
            borrowDetails[hash].friend == msg.sender,
            "You are not the friend"
        );

        borrowDetails[hash].totalBorrowed += amount;
        borrowDetails[hash].outstanding += amount;
        IERC20(token).safeTransferFrom(lender, msg.sender, amount);

        emit Borrowed(token, lender, msg.sender, amount);
    }

    function repay(address token, address lender, uint256 amount) external {
        bytes32 hash = computeHash(lender, token, msg.sender);
        if (fee == 0) {
            if (borrowDetails[hash].outstanding <= amount) {
                amount = borrowDetails[hash].outstanding;
            }

            IERC20(token).safeTransferFrom(msg.sender, lender, amount);
            borrowDetails[hash].outstanding -= amount;
        } else {
            if (
                borrowDetails[hash].outstanding +
                    (borrowDetails[hash].outstanding * fee) /
                    1000 <=
                amount
            ) {
                IERC20(token).safeTransferFrom(
                    msg.sender,
                    lender,
                    borrowDetails[hash].outstanding
                );

                IERC20(token).safeTransferFrom(
                    msg.sender,
                    feeAddress,
                    (borrowDetails[hash].outstanding * fee) / 1000
                );
                borrowDetails[hash].outstanding -= borrowDetails[hash]
                    .outstanding;
            } else {
                IERC20(token).safeTransferFrom(
                    msg.sender,
                    lender,
                    amount - (amount * fee) / 1000
                );
                IERC20(token).safeTransferFrom(
                    msg.sender,
                    feeAddress,
                    (amount * fee) / 1000
                );
                borrowDetails[hash].outstanding -=
                    amount -
                    (amount * fee) /
                    1000;
            }
        }
        emit Repaid(token, lender, msg.sender, amount);
    }

    function viewLenderAllowances(
        address lender
    ) public view returns (bytes32[] memory) {
        return borrowDetailsByLender[lender];
    }

    function viewFriendAllowances(
        address friend
    ) public view returns (bytes32[] memory) {
        return borrowDetailsByFriend[friend];
    }
    function setFee(uint _fee, address newfeeAddress) public {
        require(msg.sender == feeAddress, "You are not the owner");
        fee = _fee <= 50 ? _fee : 50;
        newfeeAddress != address(0)
            ? feeAddress = payable(newfeeAddress)
            : feeAddress = feeAddress;
    }
}
