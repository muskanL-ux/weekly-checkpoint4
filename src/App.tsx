import { useState } from "react";
import Register from "./Register";
import Login from "./Login";

function App() {
  const [page, setPage] = useState<"register" | "login">("register");

  return ( <main><div>
  {page === "register" ? <Register /> : <Login />}
 <p style={{ textAlign: "center", marginTop: "20px" }}>
 {page === "register" ? (  <>
    Already have an account?{" "}
   <button type="button" onClick={() => setPage("login")}>
     Login here </button>  </>
     ) : (   <>
     Don't have an account?{" "}
              <button type="button" onClick={() => setPage("register")}>
                Register here </button></>)}  </p> </div> </main>
  );}
export default App;