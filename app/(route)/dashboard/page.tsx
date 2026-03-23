import DoctorAgentList from "./_components/DoctorAgentList";
import HistoryList from "./_components/HistoryList";
import { AddNewSessionDialog } from "./_components/AddNewSessionDialog";


export default function Dashboard() {
    return(
        <div>
            <div className="flex justify-between items-center mt-4">
                <h2 className="font-bold text-2xl">My Dashboard</h2>
                <AddNewSessionDialog /> 
            </div>
            <HistoryList />
            <DoctorAgentList />
        </div>
    )
}