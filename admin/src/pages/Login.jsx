import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useContext } from 'react';
import { AdminContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';

const Login = () => {
    const navigate = useNavigate();
    const [state, setState] = useState('Admin');
    const { setaToken, backendUrl } = useContext(AdminContext);
    const{setDtoken}=useContext(DoctorContext)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const onsubmitHandler = async (event) => {
        event.preventDefault();
        try {
            if (state === 'Admin') {
                const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password });
                if (data.success) {
                    localStorage.setItem('aToken', data.token);
                    setaToken(data.token);
                    navigate('/admin-dashboard');
                } else {
                    toast.error(data.message);
                }
            }
            else
            {
                const {data} = await axios.post(backendUrl + '/api/doctor/login',{email,password})
                if (data.success) {
                    localStorage.setItem('dToken', data.token);
                    setDtoken(data.token);
                    console.log(data.token)
                } else {
                    toast.error(data.message);
                }

            }
        } catch (error) {
            
        }
    };

    return (
        <form onSubmit={onsubmitHandler} className='min-h-[80vh] flex items-center '>
            <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
                <p className='flex text-2xl font-semibold m-auto gap-2'>
                    <span className='text-primary '>
                        {state}
                    </span>
                    Login
                </p>
                <div className='w-full'>
                    <p>
                        Email
                    </p>
                    <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" required />
                </div>
                <div className='w-full'>
                    <p>
                        Password
                    </p>
                    <div className="relative w-full">
                        <input
                            type={showPassword ? "text" : "password"}
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            className="border border-[#DADADA] rounded w-full p-2 mt-1 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>
                <div className='w-full'>
                    <button className='bg-primary text-white w-full py-2 rounded-md text-base '>Login</button>
                    {
                        state === 'Admin'
                            ? <p>
                                Doctor Login? <span className='text-primary underline cursor-pointer' onClick={() => setState('Doctor')}>Click Here</span>
                            </p>
                            : <p>
                                Admin Login? <span className='text-primary underline cursor-pointer' onClick={() => setState('Admin')}>Click Here</span>
                            </p>
                    }
                </div>
            </div>
        </form>
    );
};

export default Login;