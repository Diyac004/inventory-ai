'use client'
import { useState,useEffect } from "react";
import {firestore} from '@/firebase';
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { collection, doc, getDocs, query, setDoc, getDoc, deleteDoc} from "firebase/firestore";
import { useTheme } from "next-themes";
// Import the functions you need from the SDKs you need

export default function Home() {
  const[inventory,setInventory]=useState([])
  const[open,setOpen]= useState(false)
  const[itemName,setItemName]= useState('')
  const { theme } = useTheme();
  const updateInventory= async()=> {
    const snapshot = query(collection(firestore,'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc)=>{
      inventoryList.push({
        name : doc.id,
        ...doc.data()
      })
    })
    setInventory(inventoryList)
  }
  
  const addItem=async(item)=>{
    const docRef = doc(collection(firestore,'inventory'),item)
    const docSnap= await getDoc(docRef)

      if(docSnap.exists()){
        const{quantity} = docSnap.data()
          await setDoc(docRef,{quantity:quantity+1})
        
      }else{
        await setDoc(docRef,{quantity: 1})
      }
    await updateInventory()
  }

  const removeItem=async(item)=>{
    const docRef = doc(collection(firestore,'inventory'),item)
    const docSnap= await getDoc(docRef)
      if(docSnap.exists()){
        const{quantity} = docSnap.data()
        if(quantity===1){
          await deleteDoc(docRef)
        }
        else{
          await setDoc(docRef,{quantity:quantity-1})
        }
      }else{
        "Item not found"
      }
    await updateInventory()
  }
  useEffect(()=>{
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const [formData, setFormData] = useState({
    item:''
  })
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.item]: e.target.value,
    })
  }
  const handleSubmit =(e)=>{
    e.preventDefault()

  }
  return (
    <body>
      <h1 class='text-8xl text-white text-center font-titleofpage mt-20 mb-14'>Inventory Tracker</h1>
      <div class="mx-auto aspect-video w-6/12 h-[600px] rounded-xl bg-white/20 shadow-lg ring-1 ring-black/5 relative">
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
         <Modal open={open} onClose={handleClose}>
          <Box position="absolute" top="50%" left="50%" sx={{transform:"translate(-50%, -50%)",}} width={400} bgcolor="white" border="2px solid #000" boxShadow={24} p={4} display="flex" flexDirection="column" gap={3}>
            <Typography variant="h6">Add Item</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField variant="outlined" fullWidth value={itemName} onChange={(e)=>{setItemName(e.target.value)}}></TextField>
              <Button variant="outlined" onClick={()=>{addItem(itemName) 
                setItemName('')
                handleClose()}}>Add</Button>
            </Stack>
          </Box>
         </Modal>
         <div className="mt-7">
         <Button variant="contained" onClick={()=>{handleOpen()}}>Add New Item</Button>
         </div>
         <Box>
          <Box width="800px" height="100px"  display="flex" alignItems="center" justifyContent="center">
            {/* <Typography variant="h2" color="#333">Inventory Items</Typography> */}
          </Box>
         
         <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {
            inventory.map(({name, quantity})=>(
              <Box key={name} width="100%" minHeight="150px" display="flex" alignItems="center" justifyContent="space-between" padding={5}>
                <Typography variant="h3" color="white" textAlign="center">{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                <Typography variant="h3" color="white" textAlign="center">{quantity}</Typography>
                <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={()=>{addItem(name)}}>Add</Button>
                <Button variant="contained" onClick={()=>{removeItem(name)}}>Remove</Button>
                </Stack>
              </Box>
            ))
          }
         </Stack>
         </Box>
         </Box>
      </div>
    </body>
   
  );
}
