'use client'
import { useState,useEffect } from "react";
import {firestore} from '@/firebase';
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { collection, doc, getDocs, query, setDoc, getDoc, deleteDoc} from "firebase/firestore";
import { useTheme } from "next-themes";
import ChatBot from "./chatbot";


export default function Home() {
  const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
  ];
  

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are an AI assistant for a customer support system specializing in inventory management for grocery stores. Your primary functions are:\n\n1. Help track food items and groceries across different store locations.\n2. Provide real-time inventory updates and alerts for low stock items.\n3. Analyze sales data and customer preferences to suggest new items that could increase sales.\n4. Assist in optimizing inventory levels to reduce waste and improve efficiency.\n5. Offer insights on seasonal trends and local preferences to tailor inventory.\n6. Help create and manage purchase orders based on inventory needs.\n7. Provide guidance on proper storage and handling of various food items.\n8. Assist in identifying slow-moving items and suggest promotional strategies.\n9. Help in implementing and maintaining a first-in-first-out (FIFO) inventory system.\n10. Offer solutions for inventory-related issues and answer any questions from store managers or staff.\n\nYour responses should be helpful, accurate, and tailored to the specific needs of grocery store inventory management. Always prioritize food safety and quality in your recommendations.",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run() {
  const chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history: [
    ],
  });
  
  const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
  console.log(result.response.text());
}
run();


  const [isClient, setIsClient] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
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
  const [chatSession, setChatSession] = useState(null);

  useEffect(()=>{
    setIsClient(true);
    updateInventory();
    setChatSession(model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    }));
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
  const sendMessage = async (message) => {
    if (!chatSession) return;
    try {
      const result = await chatSession.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error("Error sending message:", error);
      return "Sorry, I encountered an error. Please try again.";
    }
  };
  if (!isClient) {
    return null; // or a loading indicator
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
         <button
      className="px-4 py-2 bg-blue-950 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      onClick={handleOpen}
    >
      Add New Item
    </button>
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
                <button
              className="px-4 py-2 bg-blue-950 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={() => addItem(name)}
            >
              Add
            </button>
            <button
              className="px-4 py-2 bg-blue-950 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              onClick={() => removeItem(name)}
            >
              Remove
            </button>
                </Stack>
              </Box>
            ))
          }
         </Stack>
         </Box>
         </Box>
         <ChatBot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSendMessage={sendMessage}
      />
      <button
  className="fixed bottom-5 right-5 bg-blue-950 text-white p-3 rounded-full shadow-lg hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:ring-opacity-50 w-14 h-14 flex items-center justify-center"
  onClick={() => setIsChatOpen(!isChatOpen)}
>
  {isChatOpen ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  )}
</button>
      </div>
    </body>
   
  );
}
