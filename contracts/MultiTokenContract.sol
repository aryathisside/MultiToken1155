// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MultiToken is ERC1155 {
    using Strings for uint256;
    address public owner;
    mapping(uint256 => uint256) private _totalSupply;
    mapping(uint256 => string) private tokenURIs;

    constructor(string memory baseURI) ERC1155(baseURI) {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
        for (uint256 i = 0; i < ids.length; i++) {
            _totalSupply[ids[i]] += amounts[i];
        }
    }
  
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        _mint(to, id, amount, data);
        _totalSupply[id] += amount;
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override {
        for (uint256 i = 0; i < ids.length; i++) {
            require(balanceOf(from, ids[i]) >= amounts[i], "Insufficient balance");
        }
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    function burn(
        address from,
        uint256 id,
        uint256 amount
    ) public {
        require(from == _msgSender() || isApprovedForAll(from, _msgSender()), "Caller is not owner nor approved");
        require(balanceOf(from, id) >= amount, "Insufficient balance to burn");

        _burn(from, id, amount);
        _totalSupply[id] -= amount;
    }

    function burnBatch(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public {
        require(from == _msgSender() || isApprovedForAll(from, _msgSender()), "Caller is not owner nor approved");

        for (uint256 i = 0; i < ids.length; i++) {
            require(balanceOf(from, ids[i]) >= amounts[i], "Insufficient balance to burn");
            _totalSupply[ids[i]] -= amounts[i];
        }
        _burnBatch(from, ids, amounts);
    }

    function setURI(uint256 _id, string memory _uri) public onlyOwner {
        tokenURIs[_id] = _uri;
    }

    function uri(uint256 id) public view override returns (string memory) {
        if (bytes(tokenURIs[id]).length > 0) {
            return tokenURIs[id];
        } else {
            return string(abi.encodePacked(super.uri(id), id.toString(), ".json"));
        }
    }

    function totalSupply(uint256 id) public view returns (uint256) {
        return _totalSupply[id];
    }
}
