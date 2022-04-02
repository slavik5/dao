import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { parseEther } from "ethers/lib/utils";

task("addProposal", "addProposal on dao")
    .addParam("id", "amount to vote")
    .setAction(async function (taskArgs, hre) {
        const network = hre.network.name;
        console.log(network);
        const [...addr] = await hre.ethers.getSigners();
        
        const token = await hre.ethers.getContractAt("Token", process.env.Token_CONTRACT as string);
        const dao = await hre.ethers.getContractAt("Dao", process.env.Dao_CONTRACT as string);
        const abi =["function transfer(address to, uint256 amount)"]   
        const inter=new hre.ethers.utils.Interface(abi)
        const callData=inter.encodeFunctionData("transfer",[addr[1].address,100])
        
        await dao.addProposal(callData,taskArgs.account,taskArgs.description)
        console.log('addProposal task Done!');

    });