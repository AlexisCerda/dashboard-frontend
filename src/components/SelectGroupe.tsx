import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function SelectGroupe(){
  const context = useContext(AuthContext);
  
  return <>
    <select name="groupes" id="grouplist">
      <option value=""></option>
    </select>
  </>
}