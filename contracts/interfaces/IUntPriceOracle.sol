// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IUntPriceOracle{

    function setUntPrices(uint256 _nif, uint256 _eth, uint256 _usdt, uint256 _usdc) external;

    /**
     * returns (uint256 _nif, uint256 _eth, uint256 _usdt, uint256 _usdc)
     * */
    function getUntPrices() external view returns(uint256, uint256, uint256, uint256);
}