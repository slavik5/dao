import {task} from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { parseEther } from "ethers/lib/utils";

task("vote", "vote on dao")
    .addParam("id", "amount to vote")
    .addParam("account", "account to vote")
    .addParam("supportOrNot", "supportOrNot")
    .setAction(async function (taskArgs, hre) {
        const network = hre.network.name;
        console.log(network);
        const [...addr] = await hre.ethers.getSigners();
        
        const token = await hre.ethers.getContractAt("Token", process.env.Token_CONTRACT as string);
        const dao = await hre.ethers.getContractAt("Dao", process.env.Dao_CONTRACT as string);
        await dao.connect(addr[taskArgs.account]).vote(taskArgs.id,taskArgs.supportOrNot);
        console.log('vote task Done!');

    });