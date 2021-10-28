// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IExhibition{

    function isArtistExhibition() external view returns(bool);
    function controller() external view returns(address);
    function uniftyFeeAddress() external view returns(address);
}