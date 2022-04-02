// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Token.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Dao is AccessControl{
    using Address for address;
    bytes32 public constant CHAIRMAN_ROLE = keccak256("CHAIRMAN_ROLE");
    struct Proposal {
        uint256 startTime;
        uint256 quorum;
        bytes data;
        string description;
        uint256 yesCounter;
        uint256 noCounter;
        bool proposalOver;
        address whichContract;
        mapping(address=>bool) voteOrNot;
    }
    struct Voter{
       
        uint256 votes;
        uint256 time;  // the latest startTime 
    }
    uint256 private proposalId;
    mapping(uint256=>Proposal) private proposals;
    mapping(address=>Voter) private voters;
    address private tokenAddress;
    uint256 private minimumQuorum;
    uint256 private debatingTimePeriod;
    constructor(address chairman,uint256 _minimumQuorum,uint256 _debatingTimePeriod,address token_)
    {
        tokenAddress=token_;
        _setupRole(CHAIRMAN_ROLE, chairman);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        minimumQuorum=_minimumQuorum;
        debatingTimePeriod=_debatingTimePeriod;
    }
    function minimumQuorumOf() external view returns(uint256){
        return minimumQuorum;
    }
    function debatingTimePeriodOf() external view returns(uint256){
        return debatingTimePeriod;
    }
    function changeMinimumQuorum(uint256 quorum) external{
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "msg.sender not admin");
        minimumQuorum=quorum;
    }
    function changeDebatingTimePeriod(uint256 time) external{
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "msg.sender not admin");
        debatingTimePeriod=time;
    }
    function voterVotesOf(address account) external view returns(uint256){
        return voters[account].votes;
    }
    function ProposalDescriptionOf(uint256 id) external view returns(string memory){
        return proposals[id].description;
    }
    function ProposalQuorumOf(uint256 id) external view returns(uint256){
        return proposals[id].quorum;
    }
    function deposit(uint256 amount) external {
        Token(tokenAddress).transferFrom(msg.sender,  address(this), amount);
        voters[msg.sender].votes+=amount;
    }
    function addProposal(bytes memory data_,address whichContract_,string memory description_) external
    {   
        require(hasRole(CHAIRMAN_ROLE, msg.sender), "msg.sender not chairman");
        
        proposals[proposalId].startTime=block.timestamp;
        proposals[proposalId].data=data_;
        proposals[proposalId].quorum=0;
        proposals[proposalId].description=description_;
        proposals[proposalId].whichContract=whichContract_;
        proposalId+=1;
    }
    function vote(uint256 id,bool supportOrNot) external{
        require(proposals[id].voteOrNot[msg.sender]==false,"have been voted");
        require(block.timestamp-proposals[id].startTime<=debatingTimePeriod,"debatingTimePeriod passed");
        
        if(supportOrNot==true)
        {            
            proposals[id].yesCounter+=voters[msg.sender].votes;
        }else{
            proposals[id].noCounter+=voters[msg.sender].votes;
        }
        proposals[id].quorum++;
        if(proposals[id].startTime>=voters[msg.sender].time){
            voters[msg.sender].time = proposals[id].startTime;
        }
        proposals[id].voteOrNot[msg.sender]=true;
    }
    
    function finishProposal(uint256 id) external{
        require(proposals[id].quorum>=minimumQuorum,"not enough votes");
        require(block.timestamp-proposals[id].startTime>=debatingTimePeriod,"debatingTimePeriod not passed");
        require(proposals[id].proposalOver==false,"proposal already over");
        proposals[id].proposalOver=true;
        
        if(proposals[id].yesCounter>proposals[id].noCounter){
            proposals[id].whichContract.call(proposals[id].data);
            // (bool success, ) =(proposals[id].whichContract).call(
            //        proposals[id].data
            //     );
            // require(success, "ERROR call func");

        }

    }
    
    function withdraw() external{
        require(block.timestamp-voters[msg.sender].time >= minimumQuorum,"debatingTimePeriod not passed");
        Token(tokenAddress).transfer(msg.sender, voters[msg.sender].votes);
        voters[msg.sender].votes=0;
        voters[msg.sender].time=block.timestamp;
    }

} 