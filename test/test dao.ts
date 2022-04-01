import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let addr: SignerWithAddress[];
let validator: SignerWithAddress;
let Token: ContractFactory;
let token: Contract;
let Dao: ContractFactory;
let dao: Contract;
let zeroAdd: string;

function skipTime(s: number) {
    ethers.provider.send("evm_increaseTime", [s]);
    ethers.provider.send("evm_mine", []);
}

describe("Dao contract", function () {


  beforeEach(async () => {
    addr = await ethers.getSigners();
    Token = await ethers.getContractFactory("Token");
    token = await Token.deploy();
    
    Dao=await ethers.getContractFactory("Dao");
    dao=await Dao.deploy(addr[0].address,3,600,token.address);

    //await dao.grantRole(await token1.DEFAULT_ADMIN_ROLE(), chain1.address);
    //await token2.grantRole(await token2.DEFAULT_ADMIN_ROLE(), chain2.address);
    zeroAdd = '0x0000000000000000000000000000000000000000';
  });
  
  describe("changeMinimumQuorum", function () {
    it("change to 10", async function () {
        await dao.changeMinimumQuorum(10)
        expect(await dao.minimumQuorumOf()).to.equal(10);
    });
    it("msg.sender not admin", async function () {
        await expect(dao.connect(addr[1]).changeMinimumQuorum(10)).to.be.revertedWith("msg.sender not admin");
    });
    
  });
  describe("debatingTimePeriodOf", function () {
    it("change to 20 min", async function () {
        await dao.changeDebatingTimePeriod(1200)
        expect(await dao.debatingTimePeriodOf()).to.equal(1200);
    });
    it("msg.sender not admin", async function () {
        await expect(dao.connect(addr[1]).changeDebatingTimePeriod(1200)).to.be.revertedWith("msg.sender not admin");
    });
    
  });
  describe("deposit", function () {
    it("deposit 10 tokens", async function () {
        await token.mint(addr[1].address,10);
        await token.connect(addr[1]).approve(dao.address, 10);
        await dao.connect(addr[1]).deposit(10)
        expect(await dao.voterVotesOf(addr[1].address)).to.equal(10);
    });    
  });
  describe("addProposal", function () {
    it("addProposal ", async function () {
        const peremen =["function transfer(address to, uint256 amount)"]
        const inter=new ethers.utils.Interface(peremen)
        const callData=inter.encodeFunctionData("transfer",[addr[5].address,100])
        await dao.addProposal(callData,token.address,"transfer 100 tokens")

        expect(await dao.ProposalDescriptionOf(0)).to.equal("transfer 100 tokens");

        await expect(dao.connect(addr[1]).addProposal(callData,token.address,"transfer 100 tokens")).to.be.revertedWith("msg.sender not chairman");
    });    
    it("msg.sender not chairman", async function () {
       
        const peremen =["function transfer(address to, uint256 amount)"]
        const inter=new ethers.utils.Interface(peremen)
        const callData=inter.encodeFunctionData("transfer",[addr[5].address,100])
        await expect(dao.connect(addr[1]).addProposal(callData,token.address,"transfer 100 tokens")).to.be.revertedWith("msg.sender not chairman");
    });
  });
  describe("vote", function () {
    it("vote work right", async function () {
        await token.mint(addr[1].address,10);
        await token.connect(addr[1]).approve(dao.address, 10);
        await dao.connect(addr[1]).deposit(10)

        await token.mint(addr[2].address,10);
        await token.connect(addr[2]).approve(dao.address, 20);
        await dao.connect(addr[2]).deposit(10)
        const peremen =["function transfer(address to, uint256 amount)"]
        const inter=new ethers.utils.Interface(peremen)
        const callData=inter.encodeFunctionData("transfer",[addr[5].address,100])
        const abi1 =["function transfer(address to, uint256 amount)"]
        const inter1=new ethers.utils.Interface(peremen)
        const callData1=inter.encodeFunctionData("transfer",[addr[6].address,200])
        await dao.addProposal(callData,token.address,"transfer 100 tokens")
        await dao.addProposal(callData1,token.address,"transfer 200 tokens")
        
        await dao.connect(addr[1]).vote(1,true);
        await dao.connect(addr[1]).vote(0,true);
        await dao.connect(addr[2]).vote(0,true);
        expect(await dao.ProposalQuorumOf(0)).to.equal(2);

    });    
    it("test requires", async function () {
        await token.mint(addr[1].address,10);
        await token.connect(addr[1]).approve(dao.address, 10);
        await dao.connect(addr[1]).deposit(10)

        await token.mint(addr[2].address,10);
        await token.connect(addr[2]).approve(dao.address, 20);
        await dao.connect(addr[2]).deposit(10)

        const peremen =["function transfer(address to, uint256 amount)"]
        const inter=new ethers.utils.Interface(peremen)
        const callData=inter.encodeFunctionData("transfer",[addr[5].address,100])
        await dao.addProposal(callData,token.address,"transfer 100 tokens")
        await dao.connect(addr[1]).vote(0,true); 
        await expect(dao.connect(addr[1]).vote(0,true)).to.be.revertedWith("have been voted");
        skipTime(650);
        await expect(dao.connect(addr[2]).vote(0,true)).to.be.revertedWith("debatingTimePeriod passed");

    }); 
  });
  describe("finishProposal", function () {
    it("finishProposal work right", async function () {
        await token.mint(addr[1].address,10);
        await token.connect(addr[1]).approve(dao.address, 10);
        await dao.connect(addr[1]).deposit(10)

        await token.mint(addr[2].address,10);
        await token.connect(addr[2]).approve(dao.address, 20);
        await dao.connect(addr[2]).deposit(10)

        await token.mint(addr[3].address,10);
        await token.connect(addr[3]).approve(dao.address, 20);
        await dao.connect(addr[3]).deposit(10)

        await token.mint(addr[4].address,10);
        await token.connect(addr[4]).approve(dao.address, 20);
        await dao.connect(addr[4]).deposit(10)
        const abi =["function transfer(address to, uint256 amount)"]   
        const inter=new ethers.utils.Interface(abi)
        const callData=inter.encodeFunctionData("transfer",[addr[5].address,100])
        await dao.addProposal(callData,token.address,"transfer 100 tokens")
        
        await dao.connect(addr[1]).vote(0,true);
        await dao.connect(addr[2]).vote(0,true);
        await dao.connect(addr[3]).vote(0,true);
        await dao.connect(addr[4]).vote(0,false);
        
        skipTime(610);
        await dao.finishProposal(0)
        //expect(await token.balanceOf(addr[5].address)).to.equal(100);

    });
    it("not enough votes", async function () {
        await token.mint(addr[1].address,10);
        await token.connect(addr[1]).approve(dao.address, 10);
        await dao.connect(addr[1]).deposit(10)

        await token.mint(addr[2].address,10);
        await token.connect(addr[2]).approve(dao.address, 20);
        await dao.connect(addr[2]).deposit(10)
        const abi =["function transfer(address to, uint256 amount)"]   
        const inter=new ethers.utils.Interface(abi)
        const callData=inter.encodeFunctionData("transfer",[addr[5].address,100])
        await dao.addProposal(callData,token.address,"transfer 100 tokens")
        await dao.connect(addr[1]).vote(0,true);
        await dao.connect(addr[2]).vote(0,true);        
        skipTime(600);
        await expect(dao.finishProposal(0)).to.be.revertedWith("not enough votes");

    });
    it("debatingTimePeriod not passed and proposal already over", async function () {
        await token.mint(addr[1].address,10);
        await token.connect(addr[1]).approve(dao.address, 10);
        await dao.connect(addr[1]).deposit(10)

        await token.mint(addr[2].address,10);
        await token.connect(addr[2]).approve(dao.address, 20);
        await dao.connect(addr[2]).deposit(10)
        await token.mint(addr[3].address,10);
        await token.connect(addr[3]).approve(dao.address, 20);
        await dao.connect(addr[3]).deposit(10)
        const abi =["function transfer(address to, uint256 amount)"]   
        const inter=new ethers.utils.Interface(abi)
        const callData=inter.encodeFunctionData("transfer",[addr[5].address,100])
        await dao.addProposal(callData,token.address,"transfer 100 tokens")
        await dao.connect(addr[1]).vote(0,true);
        await dao.connect(addr[2]).vote(0,true);  
        await dao.connect(addr[3]).vote(0,true);        
        
        await expect(dao.finishProposal(0)).to.be.revertedWith("debatingTimePeriod not passed");
        skipTime(600);
        await dao.finishProposal(0)
        await expect(dao.finishProposal(0)).to.be.revertedWith("proposal already over");
    });
  });
  describe("withdraw", function () {
    it("withdraw work right", async function () {
        await token.mint(addr[1].address,10);
        await token.connect(addr[1]).approve(dao.address, 10);
        await dao.connect(addr[1]).deposit(10)

        const peremen =["function transfer(address to, uint256 amount)"]
        const inter=new ethers.utils.Interface(peremen)
        const callData=inter.encodeFunctionData("transfer",[addr[5].address,100])
        await dao.addProposal(callData,token.address,"transfer 100 tokens")
        
        await dao.connect(addr[1]).vote(0,true);
        await expect(dao.connect(addr[1]).withdraw()).to.be.revertedWith("debatingTimePeriod not passed");
        skipTime(600);
        await dao.connect(addr[1]).withdraw()
        expect(await token.balanceOf(addr[1].address)).to.equal(10);
    });
  });

});