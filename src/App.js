import './App.css';
// @ts-nocheck
import React from 'react';
import 'tailwindcss/tailwind.css'
import '@rainbow-me/rainbowkit/styles.css'
import { useEffect, useState } from "react";
import Button from '@mui/material/Button'
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Modal from '@mui/material/Modal'
import Snackbar from '@mui/material/Snackbar'
import Card from '@mui/material/Card'
import Dialog from '@mui/material/Dialog'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
function App() {
  const [filter, setFilter] = React.useState('All');
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const handleChange = (event) => {
    setFilter(event.target.value);
  };
  function data() {
    let t0 = []
    let oracle = []
    oracle[0] = {
      name: 'Scry Team',
      stake: '1000000',
      addrs: '0x0000000000071821e8033345a7be174647be0706',
      href: 'https://sepolia.etherscan.io/address/0x0000000000071821e8033345a7be174647be0706',
      networks: ['ethmainnet', 'sepolia', 'optimism', 'arbitrum', 'base', 'scroll', 'canto', 'arbitrum'],
      networksL: 'Ethereum, Sepolia, Optimism, Arbitrum , Base, Scroll, Canto'
    }
    oracle[1] = {
      name: 'Scry Team',
      stake: '0',
      addrs: '0x927ba066081d016184a7D74Ba231d3Ce13B10D32',
      href: 'https://sepolia.etherscan.io/address/0x927ba066081d016184a7D74Ba231d3Ce13B10D32',
      networks: ['sepolia'],
      networksL: 'Sepolia'

    }

    let oracleS = oracle
    if (filter != null && filter != 'All') {
      oracleS = oracle.filter((o) => o.networks.includes(filter));
    }
    oracleS.sort((a, b) => parseInt(b.stake) - parseInt(a.stake));
    for (let n = 0; n < oracleS.length; n++) {
      t0[n] = (<Grid><div style={{ color: '#00ff55', width: 420 }} className="flex flex-col bg-gray-800 space-y-6 justify-center mt-6 md:mt-6  m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
        <h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl md:text-3xl font-extrabold w-3/4">
          {oracleS[n].name}
        </h1>
        <h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl font-bold w-3/4">
          Staked: {oracleS[n].stake}
        </h1>
        <div style={{ color: '#77ff8b' }} className="m-auto text-center color-green-500 text-1xl font-bold">
          Address: <br />{oracleS[n].addrs}
        </div>
        <div style={{ color: '#77ff8b' }} className='mx-6'>
          Supported networks: {oracleS[n].networksL}
        </div>
      </div></Grid>
      )
    } return (<Grid container spacing={2} className="bg-gray-900 w-3/4">{t0}</Grid>)
  }

  return (
    <div style={{ color: '#00ff55' }} className="bg-gray-900 h-full w-full min-h-screen" >
      <div style={{ color: '#00ff55' }} className="flex flex-col bg-gray-800 space-y-6 mx-6 justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
        <h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl md:text-3xl font-extrabold w-3/4">
          Welcome to Morpheus
        </h1><div style={{ color: '#77ff8b' }}>
          Morpheus is designed to create a fully decentralized data market, allowing anyone to host an oracle and anyone to request data for a fee, creating a free and open data market. Oracles can stake $SCRY to create economic incentives to provide honest data to not be slashed. Anyone can run a Scry Morpheus node and help the network and developers access data when they need it.
        </div>
        <Button onClick={() => window.location.assign('https://docs.scry.finance/docs/morpheus/morpehus')} style={{ color: '#77ff8b' }} variant='outlined' className="m-auto text-center bottom-4 color-green-500 border-green-500">Morpheus Docs</Button>
      </div><div style={{ color: '#00ff55' }} className="flex flex-col justify-center m-auto overflow-hidden">

        <InputLabel id="filter-label" style={{ color: '#00ff55' }} className="m-auto text-center md:mt-8 color-green-500 text-2xl font-bold w-3/4">Filter Network</InputLabel>
        <Select
          labelId="filter-label"
          id="filter-select"
          value={filter} style={{ color: '#00ff55' }}
          onChange={handleChange} className="bg-gray-800 w-80 text-center flex flex-col justify-center mt-4 md:mt-4 px-4 xs:px-0 m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
          <MenuItem value="All">All</MenuItem><MenuItem value="ethmainnet">Ethereum</MenuItem><MenuItem value="sepolia">Sepolia</MenuItem>
          <MenuItem value="arbitrum">Arbitrum</MenuItem><MenuItem value="canto">Canto</MenuItem><MenuItem value="optimism">Optimism</MenuItem>
          <MenuItem value="base">Base</MenuItem>
          <MenuItem value="scroll">Scroll</MenuItem>
        </Select></div><div style={{ top: 10, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="bg-gray-900">{data()}</div>
    </div>
  )
}

export default App;
