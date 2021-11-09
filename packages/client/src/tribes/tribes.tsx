import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
//@ts-ignore
import DappLib from "@decentology/dappstarter-dapplib"
import "./styles/Tribes.css"
import Nav from "./components/Nav"
import Footer from "./components/Footer"

import { ACCOUNT } from "./shared"

const TribesPage = (props: any) => {
  const [currentTribe, setCurrentTribe] = useState()
  const [showError, setShowError] = useState(false)
  const [error, setError] = useState(false)
  const navigate = useNavigate()


  useEffect(() => {
    const getCurrentTribe = async () => {
      const data = {
        tenantOwner: ACCOUNT.Admin,
        account: ACCOUNT.Birbal,
      }
      try {
        const stuff = await DappLib.TribesGetCurrentTribe(data)
        setError(false)
        setCurrentTribe(stuff.result)
      } catch (error) {
        // This will only happen if you haven't run "instance"
        // for an account under the Tenant module,
        // and your `tenantOwner` isn't that same account.
        setError(true)
      }
    }

    getCurrentTribe()
  }, [])

  return (
    <main>
      <Nav />
      <div className="hero">
        <div className="header">
          <h1> Tribes</h1>
          {!currentTribe ? (
            <button
              className="join"
              onClick={() => {
                error ? setShowError(true) : navigate("/all-tribes")
              }}
            >
              Join A Tribe
            </button>
          ) : (
            <button className="join" onClick={() => navigate("/my-tribe")}>
              View Your Tribe
            </button>
          )}
          {showError && (
            <div className="error">
              <p>Two things could be wrong:</p>
              <ul>
                <li>
                  1) You have not called `instance` for an account in the Tribes
                  module. <a href="http://localhost:5000/playground/harness/core-tribes" target="_blank" rel="noreferrer">Enter playground to fix this.</a>
                </li>
                <li>
                  2) The `tenantOwner` field in `getCurrentTribe` function is
                  not the account you used in the first step.
                </li>
              </ul>
              <p>
                Need Help?
                <a href="https://docs-hyperhack.decentology.com/learn-with-examples" target="_blank" rel="noreferrer"> Watch the tutorial.</a>
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}

export default TribesPage
