import { useState } from 'react'
import { AuthContext } from '../contexts/Auth'
import { signOut, getAuth } from 'firebase/auth'




function AuthProvider({ children }) {

    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [authClaims, setAuthClaims] = useState(null)


    const auth = getAuth()
    const logout = () => {
        signOut(auth)
    }

    const value = {
        loading,
        currentUser,
        authClaims,
        logout,
        setAuthClaims,
        setCurrentUser,
        setLoading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider