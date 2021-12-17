import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
//@ts-ignore
import DappLib from "@decentology/dappstarter-dapplib"
import "./styles/Tribes.css"
import Nav from "./components/Nav"
import Footer from "./components/Footer"

import { ACCOUNT } from "./shared"

const CollectionPage = (props: any) => {
  const [currentCollection, setCurrentCollection] = useState()
  const [showError, setShowError] = useState(false)
  const [error, setError] = useState(false)
  const navigate = useNavigate()


  useEffect(() => {
    const getCurrentCollection = async () => {
      const data = {
        tenantOwner: ACCOUNT.Admin,
        account: ACCOUNT.Birbal,
      }
      try {
        const stuff = await DappLib.SimpleNFTGetNFTIDs(data)
        setError(false)
        setCurrentCollection(stuff.result)
      } catch (error) {
        // This will only happen if you haven't run "instance"
        // for an account under the Tenant module,
        // and your `tenantOwner` isn't that same account.
        setError(true)
      }
    }

    getCurrentCollection()
  }, [])

  return (
    <main>
      <Nav />
      <div className="hero">
        <div className="header">
          <h1> Basic Beasts</h1>
          {!currentCollection ? (
            <button
              className="join"
              onClick={() => {
                error ? setShowError(true) : navigate("all-tribes-copy")
              }}
            >
              {!error ? 'See your Beasts' : 'Mint a Beast'}

            </button>
          ) : (
            <button className="join" onClick={() => navigate("my-tribe-copy")}>
              View Your Beasts
            </button>
          )}
          {showError && (
            <div className="error">
              <p>To Get Beasts running, you need to have an`instance` for the Admin account in the Beasts
                module. <a href="http://localhost:5000/playground/harness/core-nft" target="_blank" rel="noreferrer">Enter playground to do this.</a>
              </p>
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

export default CollectionPage
