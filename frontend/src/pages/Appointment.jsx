import React, { useContext, useState } from 'react'; // Removed 'use' as it's not a React hook
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useEffect } from 'react';
import { assets } from '../assets/assets';
import RealtedDoctors from '../components/RealtedDoctors';
import { toast } from 'react-toastify';
import axios from  'axios'
const Appointment = () => {
    const { docId } = useParams();
    const { userId,doctors, currencySymbol,backendUrl,token,getDoctorsData } = useContext(AppContext);
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const navigate = useNavigate()

    const [docInfo, setDocInfo] = useState(null);
    const [docSlots, setDocSlots] = useState([]);
    const [slotIndex, setSlotIndex] = useState(0);
    const [slotTime, setSlotTime] = useState('');

    const fetchDocInfo = async () => {
        const docInfo = doctors.find(doc => doc._id === docId);
        setDocInfo(docInfo);
    };

    const getAvailableSlots = async () => {
        setDocSlots([]);

        let today = new Date();

        for (let i = 0; i < 7; i++) {
            let currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);

            let endTime = new Date(currentDate);
            endTime.setHours(21, 0, 0, 0);

            let timeSlotsForThisDay = [];

            if (today.getDate() === currentDate.getDate() && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear()) {
                const now = new Date();

                let startHour = now.getHours();
                let startMinute = now.getMinutes();

                if (startMinute < 30) {
                    startMinute = 30;
                } else {
                    startHour++;
                    startMinute = 0;
                }

                if (startHour < 10) {
                    startHour = 10;
                    startMinute = 0;
                }

                currentDate.setHours(startHour, startMinute, 0, 0);

                if (currentDate >= endTime) {
                    setDocSlots(prev => ([...prev, []]));
                    continue;
                }
            } else {
                currentDate.setHours(10, 0, 0, 0);
            }

            while (currentDate < endTime) {
                let formattedTime = currentDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
});
                let day = currentDate.getDate()
                let month = currentDate.getMonth()+1
                let year = currentDate.getFullYear()

                const slotDate = day + "_" + month + "_" + year
                const slotTime = formattedTime

                const isSlotAvailable = docInfo.slots_booked && docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true;

                if(isSlotAvailable)
                {
                    timeSlotsForThisDay.push({
                    datetime: new Date(currentDate),
                    time: formattedTime
                });

                }

                
                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }

            setDocSlots(prev => ([...prev, timeSlotsForThisDay]));
        }
    };

    const bookAppointment = async ()=>{
        if(!token){
            toast.warn('login to book appointment')
            return navigate('/login')
        }
        try {

            const date = docSlots[slotIndex][0].datetime
            
            let day = date.getDate()
            let month = date.getMonth()+1
            let year = date.getFullYear()

            const slotDate = day + "_" + month + "_" + year
            console.log('Booking data:', { userId, docId, slotDate, slotTime })
            const {data} = await axios.post(backendUrl + '/api/user/book-appointment',{userId,docId,slotDate,slotTime},{headers:{token}})
           
            if(data.success){
                toast.success(data.message)
                getDoctorsData()
                navigate('/my-appointments')
            }
            else{
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }
    
    

    useEffect(() => {
        fetchDocInfo();
    }, [doctors, docId]);

    useEffect(() => {
        getAvailableSlots();
    }, [docInfo]);

    useEffect(() => {
        console.log(docSlots);
    }, [docSlots]);

    return docInfo && (
        <div>
            {/*-------doctor details---------*/}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div>
                    <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
                </div>
                <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
                    {/*-------doc info name degree and experienc---------*/}
                    <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
                        {docInfo.name}
                        <img className='w-5' src={assets.verified_icon} alt="" />
                    </p>
                    <div className='flex item-center gap-2 text-sm mt-1 text-gray-600'>
                        <p>
                            {docInfo.degree} - {docInfo.speciality}
                        </p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>
                            {docInfo.experience}
                        </button>
                    </div>
                    {/*----doctor about---------*/}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
                            About <img src={assets.info_icon} alt="" />
                        </p>
                        <p className='text-sm text-gray-500 max-w-[700px] mt-1'>
                            {docInfo.about}
                        </p>
                    </div>
                    <p>
                        Appointment fee: <span>{currencySymbol}{docInfo.fees}</span>
                    </p>
                </div>
            </div>

            {/*---------BOOKING SLOTS -----*/}
            <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
                <p>
                    Booking slots
                </p>

                <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
                    {
                        docSlots.length > 0 && docSlots.map((item, index) => {
                            if (item.length === 0) {
                                return null; // Hide the day if no slots available
                            }
                            return (
                                <div
                                    className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray'}`}
                                    key={index}
                                    onClick={() => setSlotIndex(index)} // Added onClick to select day
                                >
                                    <p>
                                        {daysOfWeek[item[0].datetime.getDay()]}
                                    </p>
                                    <p>
                                        {item[0].datetime.getDate()}
                                    </p>
                                </div>
                            );
                        })
                    }
                </div>
                <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
                    {docSlots.length && docSlots[slotIndex].map((item,index)=>(
                        <p onClick={()=>setSlotTime(item.time)} className={`text-s font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time=== slotTime ?'bg-primary text-white':'text-gray-400 border border-gray-300'}`} key={index}>
                            {item.time.toLowerCase()}

                        </p>

                    ))}
               </div>
                <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6 '>Book an appointment</button>
            </div>
           {/* releated doctors */}
           <RealtedDoctors docId={docId} speciality={docInfo.speciality}/>
        </div>
    );
};

export default Appointment;