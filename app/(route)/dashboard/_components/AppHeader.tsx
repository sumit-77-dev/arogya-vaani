import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
function AppHeader() {
  const menbuoption = [
    {
      id:1,
      name:'Home',
      path:'/dashboard'
    },
    {
      id:2,
      name:'Profile',
      path:'/profile'
    },
    {
      id:3,
      name:'History',
      path:'/history'
    }
  ]
  return (
    <div className='flex items-center justify-between p-4 shadow-sm lg:px-40'>
      <div className='flex items-center gap-2'>
        <Image src="/logo.svg" alt="logo" width={40} height={40} />
        <h1 className='font-bold text-2xl text-[#5cac94]'>Arogya <span className='text-primary'>Vaani</span></h1>
      </div>
      <div className='hidden md:flex item-center gap-8 mr-20'>
        {menbuoption.map((item) => (
          <Link key={item.id} href={item.path} className='hover:text-primary hover:font-bold cursor-pointer'>
            {item.name}
          </Link>
        ))}
      </div>
      <UserButton />
    </div>
  )
}

export default AppHeader