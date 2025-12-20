
import { IoAddSharp } from "react-icons/io5";


export default function Hospitals(){
    return(
        <main className="mt-4 flex flex-col gap-2  px-4">
            
            {/* title/header */}
            <div className="flex justify-between">
                {/* branches */}
                <div className="p-2 bg-blue-500 rounded-md flex flex-col items-center h-fit w-fit text-white">
                    <h2 className="capitalize font-semibold text-lg">all branches</h2>
                    <p className="font-bold text-xl">8</p>
                </div>

                {/* select */}
                <div className="flex gap-2 items-center">
                    <label htmlFor="hospital">choose hospital</label>
                    <select name="hospital" id="hospital" className="w-fit border border-gray-200 p-2">
                        <option value="">---Choose hospital---</option>
                        <option value="">hospital A</option>
                        <option value="">hospital B</option>
                        <option value="">hospital C</option>
                        <option value="">hospital D</option>
                        <option value="">hospital E</option>
                    </select>
                </div>

                {/* add */}
                <div>
                    <button className="p-2 rounded-md bg-green-400 flex"><IoAddSharp size={24} className="text-white" /><span className="ml-2">Hospital</span></button>
                </div>
            </div>

            {/* summary */}
            <div className="flex justify-between">
                <div className="border border-gray-200 rounded-md flex flex-col items-center p-2 h-fit w-fit">
                    <h2>total staff</h2>
                    <h2>29</h2>
                </div>

                <div className="border border-gray-200 rounded-md flex flex-col items-center p-2 h-fit w-fit">
                    <h2>total sales</h2>
                    <h2>kes 2,900,000</h2>
                </div>

                <div className="border border-gray-200 rounded-md flex flex-col items-center p-2 h-fit w-fit">
                    <h2>total products</h2>
                    <h2>204</h2>
                </div>

                <div className="border border-gray-200 rounded-md flex flex-col items-center p-2 h-fit w-fit">
                    <h2>total assets</h2>
                    <h2>32</h2>
                </div>

                <div className="border border-gray-200 rounded-md flex flex-col items-center p-2 h-fit w-fit">
                    <h2>total expenses</h2>
                    <h2>kes 480,000</h2>
                </div>

                <div className="border border-gray-200 rounded-md flex flex-col items-center p-2 h-fit w-fit">
                    <h2>total pharmacy</h2>
                    <h2>8</h2>
                </div>
            </div>

            {/* hospital navbar */}
            <div className="bg-gray-200 border border-gray-400 p-2 rounded-md flex justify-between gap-42 mx-auto mt-4">
                <button>staff</button>
                <button>sales</button>
                <button>products</button>
                <button>assets</button>
                <button>expenses</button>
                <button>pharmacy(s)</button>
            </div>
        </main>
    )
}