//@ts-ignore
import DappLib from "@decentology/dappstarter-dapplib";


const accounts = DappLib.getAccounts();
export let ACCOUNT = {
  "Admin": accounts[0],
  "Alice": accounts[1],
  "Birbal": accounts[2],
  "Chen": accounts[3],
  "Damian": accounts[4]
}
