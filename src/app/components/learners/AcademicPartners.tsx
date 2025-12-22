import React from 'react'
import Image from 'next/image';
import logoo from '@/assets/logoo.jpeg';
import rsmred from "@/assets/rsmred.png";


function AcademicPartners() {
  return (
    <section className="my-12 px-8">
            <div>
              <div className='heading-box'>
              <h2 className="text-center ">
                <span>
                Academic Partners
                </span>
              </h2>
              </div>
              <div className="flex gap-5 justify-center">
                <div className="flex gap-5">
                  <div className="!m-auto">
                    <Image
                      src={logoo}
                      alt="Partner 1"
                      width={120}
                      height={120}
                      style={{ objectFit: "cover" }}
                      className="object-center"
                    />
                  </div>
                  <div className="!m-auto ">
                    <Image
                      src={rsmred}
                      alt="Partner 2"
                      width={120}
                      height={120}
                      style={{ objectFit: "cover" }}
                      className="object-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
  )
}

export default AcademicPartners
