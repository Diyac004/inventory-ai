
import { useState,useEffect } from "react";
import {firestore} from '@/firebase';
import { collection, doc, getDocs, query, setDoc, getDoc, deleteDoc} from "firebase/firestore";
import { useTheme } from "next-themes";

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
      
      </div>
    </body>
   
  );
}
