import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
//@ts-ignore
import DappLib from "@decentology/dappstarter-dapplib"
import "./styles/Tribes.css"
import Nav from "./components/Nav"

import { ACCOUNT } from "./shared"

const AllTribes = () => {
  const navigate = useNavigate()
  const [allTribes, setAllTribes] = useState()

  const getAllTribes = async () => {
    const data = {
      tenantOwner: ACCOUNT.Admin,
      account: ACCOUNT.Birbal,
    }
    const allTribes = await DappLib.TribesGetAllTribes(data)
    setAllTribes(allTribes.result)

  }


  const joinTribe = async (tribe: String) => {
    try {
      const data = {
        tenantOwner: ACCOUNT.Admin,
        signer: ACCOUNT.Birbal,
        tribeName: tribe,
      }

      const result = await DappLib.TribesJoinTribe(data)
      if (result) navigate("/my-tribe")
    } catch (error) { }
  }

  useEffect(() => {
    getAllTribes()
  }, [])

  return (
    <main>
      <Nav />
      <div className="container">
        <h1>Tribes</h1>
        {Object.keys(allTribes ?? {}).length === 0 ? (
          <>
            <h5>There are currently no existing tribes.</h5>
            <a href="/">Go back home</a>
          </>
        ) :
          <>
            <h5>Select Your Tribe</h5>
            <div className="all-tribes">
              {/* @ts-ignore */}
              {Object.entries(allTribes).map(([k, v]) => (
                <div key={k} onClick={() => joinTribe(k)}>
                  {/* @ts-ignore */}
                  <img className="cards" src={v.ipfsHash} alt={k} />
                </div>
              ))}
            </div>
          </>
        }
      </div>
    </main>
  )
}

export default AllTribes
