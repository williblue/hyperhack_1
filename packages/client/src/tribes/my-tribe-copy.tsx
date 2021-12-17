import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
//@ts-ignore
import DappLib from "@decentology/dappstarter-dapplib"
import "./styles/Tribes.css"
import Nav from "./components/Nav"

import { ACCOUNT } from "./shared"

const CollectionPage = () => {
    const navigate = useNavigate()
    const [currentCollection, setCurrentCollection] = useState<{
        description: string
        ipfsHash: string
        ids: string
    } | null>()

/*
    const leaveTribe = async () => {
        const data = {
            tenantOwner: ACCOUNT.Admin,
            signer: ACCOUNT.Birbal,
        }
        const result = await DappLib.TribesLeaveTribe(data)
        if (result) navigate("..")
    }
*/
    useEffect(() => {
        const getCurrentCollection = async () => {
            const data = {
                tenantOwner: ACCOUNT.Admin,
                account: ACCOUNT.Birbal,
            }

            const collection = await DappLib.SimpleNFTGetNFTIDs(data)


            setCurrentCollection(collection.result)
        }
        getCurrentCollection()
    }, [])


    return (
        <main>
            <Nav />
            {currentCollection && (
                <div className="container-2">
                    <div className="container-3">
                        {currentCollection.ipfsHash === 'N/A' ? <div className="tribe-card"><h2 >{currentCollection.ids}</h2></div> : <img
                            src={currentCollection.ipfsHash}
                            alt={currentCollection.ids}
                            className="tribe"
                        />}

                        <div className="text">
                            <h1>{currentCollection.ids}</h1>
                            {console.log("current collection: "+ currentCollection)}
                            {/*currentCollection.map((id, i) => (<div key={id+i}>{id}</div>))*/}
                            <div className="text">{currentCollection}</div>
                            <p className="description">{currentCollection.description}</p>
                        </div>
                    </div>
               
                </div>
            )}
        </main>
    )
}

export default CollectionPage
