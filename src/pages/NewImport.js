import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import data from '../helpers/mock-data.json'
import Pagination from '../helpers/Pagination'
import SearchBar from '../components/searchBar/SearchBar'
import { Table, Alert } from 'react-bootstrap'
import Header from '../components/header/Header';
import { FaEllipsisV } from "react-icons/fa";
import { getDoc, getDocs, collection, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../helpers/firebase'
import { currencyFormatter } from "../helpers/currency.format";
import { MdInfo, MdAutorenew, MdCancel, MdDelete } from 'react-icons/md'
import useAuth from '../contexts/Auth'
import { authentication } from '../helpers/firebase'

function NewImport() {

    useEffect(() => {
      document.title = 'Britam - New Imports'
      getNewImport()
    }, [])

    const { authClaims } = useAuth()

    // policies
  const [policies, setPolicies] = useState([])
  const policyCollectionRef = collection(db, "policies");
  const [editID, setEditID] = useState(null);

  const getNewImport = async () => {
    const data = await getDocs(policyCollectionRef);
    const pole = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    // setPolicies(pole.filter(policy => policy.category === 'windscreen').filter(policy => policy.added_by_uid === authentication.currentUser.uid))
    setPolicies(pole)
  }

  // Confirm Box
  const [ openToggle, setOpenToggle ] = useState(false)
  window.onclick = (event) => {
    if(openToggle === true) {
      if (!event.target.matches('.wack') && !event.target.matches('#myb')) { 
        setOpenToggle(false)
    }
    }
  }

    // search by Name
    const [searchText, setSearchText] = useState('')
    const handleSearch = ({ target }) => setSearchText(target.value);
    const searchByName = (data) => data.filter(row => row.clientDetails).filter(row => row.clientDetails.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1)

    // delete a policy
  const handleDelete = async id => {
    const policyDoc = doc(db, "policies", id);
    await deleteDoc(policyDoc);
  }



  
   // actions context
   const [showContext, setShowContext] = useState(false)
   if(showContext === true){
     window.onclick = function(event) {
         if (!event.target.matches('.sharebtn')) {
             setShowContext(false)
         }
     }
   }
   const [clickedIndex, setClickedIndex] = useState(null)
 
   const [ deleteName, setDeleteName ] = useState('')
   const getPolicy = async (id) => {
     const policyDoc = doc(db, "policies", id);
     return await getDoc(policyDoc).then(result => setDeleteName(result.data().clientDetails.name))
   }

   // pagination
   const [ currentPage, setCurrentPage ] = useState(1)
   const [policiesPerPage] = useState(10)

   const indexOfLastPolicy = currentPage * policiesPerPage
   const indexOfFirstPolicy = indexOfLastPolicy - policiesPerPage
   const currentPolicies = searchByName(policies).slice(indexOfFirstPolicy, indexOfLastPolicy)
   const totalPagesNum = Math.ceil(policies.length / policiesPerPage)

    return (
        <div className='components'>
            <Header title="New Imports" subtitle="MANAGING WINDSCREEN" />

            {(authClaims.supervisor || authClaims.agent) && 
              <div id="add_client_group">
                  <div></div>
                  <Link to="/agent/add-new-import">
                      <button className="btn btn-primary cta">Add New Import</button>
                  </Link>
              </div>
            }

            <div className={openToggle ? 'modal is-active': 'modal'}>
              <div className="modal__content wack">
                <h1 className='wack'>Confirm</h1>
                <p className='wack'>Are you sure you want to delete <b>{deleteName}</b></p>
                <div className="buttonContainer wack" >
                  <button id="yesButton" onClick={() => {
                    setOpenToggle(false)
                    handleDelete(editID)
                    getNewImport()
                    }} className='wack'>Yes</button>
                  <button id="noButton" onClick={() => setOpenToggle(false)} className='wack'>No</button>
                </div>
              </div>
            </div>


            <div className="shadow-sm table-card componentsData">   
                <div id="search">
                    <SearchBar placeholder={"Search Policy by name"} value={searchText} handleSearch={handleSearch}/>
                    <div></div>
                    <div></div>
                </div>

                <Table striped hover responsive>
                    <thead>
                        <tr><th>#</th><th>Client</th><th>Category</th><th>Amount</th><th>Currency</th>
                        {!authClaims.agent && <th>Agent</th>}
                        <th>Training Levy</th><th>Status</th><th>CreatedAt</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {policies.length > 0 && currentPolicies.map((policy, index) => 
                         (
                            <tr key={policy.id}>
                                <td>{indexOfFirstPolicy + index + 1}</td>
                                <td>{policy.clientDetails.name}</td>
                                <td>{policy.stickersDetails[0].category}</td>
                                <td><b>{currencyFormatter(policy.stickersDetails[0].totalPremium)}</b></td>
                                <td>{typeof policy.currency == "string" ? policy.currency : ''}</td>
                                {!authClaims.agent && <td>{policy.agentName ? policy.agentName : ''}</td>}
                                <td>10,000</td>
                                <td>
                                  <span
                                    style={{backgroundColor: "#337ab7", padding: ".4em .6em", borderRadius: ".25em", color: "#fff", fontSize: "85%"}}
                                  >new</span>
                                </td>
                                
                                <td>{policy.policyStartDate}</td>
                                
                                <td className="started">
                                <button className="sharebtn" onClick={() => {setClickedIndex(index); setShowContext(!showContext); setEditID(policy.id); getPolicy(policy.id)}}>&#8942;</button>

                                <ul  id="mySharedown" className={(showContext && index === clickedIndex) ? 'mydropdown-menu show': 'mydropdown-menu'} onClick={(event) => event.stopPropagation()}>
                                  <Link to={`/admin/policy-details/${policy.id}`}>
                                    <div className="actionDiv">
                                      <i><MdInfo /></i> Details
                                    </div>
                                  </Link>
                                  <Link to={`/admin/policy-renew/${policy.id}`}>
                                    <div className="actionDiv">
                                      <i><MdAutorenew /></i> Renew
                                    </div>
                                  </Link>
                                  <li>
                                    <div className="actionDiv">
                                      <i><MdCancel /></i> Cancel
                                    </div>
                                  </li>
                                  <li onClick={() => {
                                            setOpenToggle(true)
                                            setEditID(policy.id);
                                            setShowContext(false)
                                          }}
                                      >
                                        <div className="actionDiv">
                                          <i><MdDelete/></i> Delete
                                        </div>
                                  </li>
                                </ul>
                  </td>
                  </tr>
                  
                          )
                        
                        )}
                    </tbody>
                    <tfoot>
                        <tr><th>#</th><th>Client</th><th>Category</th><th>Amount</th><th>Currency</th>
                        {!authClaims.agent && <th>Agent</th>}
                        <th>Training Levy</th><th>Status</th><th>CreatedAt</th><th>Action</th></tr>
                    </tfoot>
                </Table>

                <Pagination 
                    pages={totalPagesNum}
                    setCurrentPage={setCurrentPage}
                    currentClients={currentPolicies}
                    sortedEmployees={policies}
                    entries={'New Import policies'} />

               
            </div>
        </div>
    )
}

export default NewImport