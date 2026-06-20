import React from 'react'
import AppHeader from '@/app/(route)/dashboard/_components/AppHeader'

export default function ProfileLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>){
    return (
        <div>
            <AppHeader />
            <div className='px-4 md:px-10 lg:px-40'>
                {children}
            </div>
            
        </div>
    )
} 