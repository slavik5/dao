import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { parseEther } from "ethers/lib/utils";


task("addProposal", "addProposal on dao")
    .addParam("data", "amount to vote")
    .addParam("addr", "address for selector")
    .addParam("description", "description of proposal")
    .setAction(async function (taskArgs, hre) {
        const network = hre.network.name;
        console.log(network);
        const [...addr] = await hre.ethers.getSigners();
        
        const token = await hre.ethers.getContractAt("Token", process.env.Token_CONTRACT as string);
        const dao = await hre.ethers.getContractAt("Dao", process.env.Dao_CONTRACT as string);
        
        await dao.finishProposal(taskArgs.id)
        console.log('finish task Done!');

    });