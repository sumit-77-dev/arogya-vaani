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
    },
    {
      id:4,
      name:'Pricing',
      path:'/pricing'
    }
  ]
  return (
    <div className='flex items-center justify-between p-4 shadow-sm lg:px-40'>
      <Image src="/logo.svg" alt="logo" width={40} height={40} />
      <div className='hidden md:flex item-center gap-8'>
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