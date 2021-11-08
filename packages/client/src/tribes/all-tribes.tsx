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
  const [error, setError] = useState("")

  const getAllTribes = async () => {
    try {
      const data = {
        tenantOwner: ACCOUNT.Admin,
        account: ACCOUNT.Birbal,
      }
      const allTribes = await DappLib.TribesGetAllTribes(data)
      setAllTribes(allTribes.result)
    } catch (error) {
      setError("There are currently no existing tribes.")
    }
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
    } catch (error) {}
  }

  useEffect(() => {
    getAllTribes()
  }, [])

  return (
    <main>
      <Nav />
      <div className="container">
        <h1>Tribes</h1>
        <h5>Select Your Tribe</h5>
        {!allTribes && (
          <>
            {" "}
            <h5>{error}</h5>
            <a href="/">Go back home</a>
          </>
        )}
        {allTribes && (
          <div className="all-tribes">
            {Object.entries(allTribes).map(([k, v]) => (
              <div key={k} onClick={() => joinTribe(k)}>
                <img className="cards" src={v.ipfsHash} alt={k} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default AllTribes
