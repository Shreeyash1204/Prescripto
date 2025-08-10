import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>
          About <span className='text-gray-700 font-medium'>Us</span>
        </p>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px]' src={assets.about_image} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600 '>
          <p>welcome to Prescripto your trusted partner in managing your healthcare needs connvienently and efficently.At prescripto we understand the challenges individual faces when it comes to selecting doctor appointments and managing their health records</p>
          <p>Prescripto is Committed to Excellence in Healthcare Technology, We Continuously Strive To Enhance Our Phutfarm, integrating The Latest Advancements To improve User Experience And Deliver Superior Service Whether You're Booking Tour Print Appointment Dr Managing Ongoing Care, Erstellt Here To Support You Every Step Of The Way</p>
          <b className='text-gray-800 '>Our Vision</b>
          <p>Our Vision At Prescripto To Create A Seomiess Healthcare Experience For Every User. We Aim The Bridge The Gap Between Patients And Healthcare Providers, Making it Easier For You To Access The Care You Need. When You Need It</p>
        </div>
      </div>

      <div className='text-xl my-4'>
        <p>WHY <span className='text-gray-700 font-semibold'>CHOOSE US</span> </p>
      </div>

      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-grey-600 cursor-pointer'>
          <b>EFFICIENCY</b>
          <p>Streamlined Appointment Scheduling That Fits to Your Busy Lifestyle</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-grey-600 cursor-pointer'>
          <b>CONVENIENCE</b>
          <p>Access To A Network Of Trusted Healthcare Professionals in Your Areas</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-grey-600 cursor-pointer'>
          <b>PERSONALIZATION</b>
          <p>Tailored Recommendations And Reminders. To Help You Stay On To  Of Your Health</p>
        </div>
      </div>
    </div>
  )
}

export default About