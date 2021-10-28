pragma solidity ^0.8.7;

import "./Tools.sol";

contract UntPriceOracle is Ownable, WhitelistAdminRole{
    
    
    uint256 public nif;
    uint256 public eth;
    uint256 public usdt;
    uint256 public usdc;
    
    function setUntPrices(uint256 _nif, uint256 _eth, uint256 _usdt, uint256 _usdc) external onlyWhitelistAdmin{
        
        nif = _nif;
        eth = _eth;
        usdt = _usdt;
        usdc = _usdc;
    }
    
    function getUntPrices() external view returns(uint256, uint256, uint256, uint256){
        
        return (nif, eth, usdt, usdc);
    }
}