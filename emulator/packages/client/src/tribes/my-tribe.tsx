import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
//@ts-ignore
import DappLib from "@decentology/dappstarter-dapplib";
import './styles/Tribes.css'
import Nav from './components/Nav';

import { ACCOUNT } from './shared';

const TribesPage = () => {
    const navigate = useNavigate();
    const [currentTribe, setCurrentTribe] = useState<{ description: String, ipfsHash: String, name: String } | null>()
    const data = {
        tenantOwner: ACCOUNT.Admin,
        account: ACCOUNT.Birbal
    }
    const getCurrentTribe = async () => {
        const tribe = await DappLib.TribesGetCurrentTribe(data)
        setCurrentTribe(tribe.result)

    }

    const leaveTribe = async () => {
        const data = {
            tenantOwner: ACCOUNT.Admin,
            signer: ACCOUNT.Birbal
        }
        const result = await DappLib.TribesLeaveTribe(data)
        if (result) navigate('/')
    }




    useEffect(() => {
        getCurrentTribe()
    }, [])

    return (
        <main>
            <Nav />
            {currentTribe &&
                <div className="container-2">
                    <div className="container-3">
                        <img src={currentTribe.ipfsHash} alt={currentTribe.name} className="tribe" />
                        <div >
                            <h1>{currentTribe.name}</h1>
                            <p className="description">{currentTribe.description}</p>
                        </div>
                    </div>
                    <button className="join" onClick={leaveTribe}>Leave Tribe</button>
                </div>
            }

        </main >

    );

}



export default TribesPage;