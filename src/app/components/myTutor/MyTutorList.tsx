import React from 'react'
import { Button, Dropdown, Form } from 'react-bootstrap'
import Pagination from 'react-bootstrap/Pagination';
import Student01 from '../../../assets/student-01.png'
import Link from 'next/link';
import Image from 'next/image';
// import './MyStudentsList.css'
// import AddNewStudentModal from './AddNewStudentModal';
// import AddNewCourseModal from './AddNewCourseModal';


const MyTutorList = () => {
  return (
    
    <div className='card-box'>
        <div className='assignments-list-sec'>
            <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap flex-wrap">
               <div className='left-head'>
                    <h2 className='m-0'>My Tutors</h2>
               </div>
            </div>
            <hr className='hr-light'/>
            <div className='assignments-list-com'>
                <div className='table-sec w-1450'>
              <div className="table-responsive">
                <table className="table align-middle m-0">
                  <thead>
                    <tr>
                      <th >Name</th>
                      <th >Instrument</th>
                      <th >Course Duration</th>
                      <th >Upcoming Class</th>
                      <th>Experience</th>
                      <th>Fees</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                         <Link href="/tutor-details" className='student-img-name d-flex align-items-center gap-2'>
                            <Image src={Student01} alt="" />
                            <span className='name'>Mabel Mueller</span>
                        </Link>
                      </td>
                      <td>Piano</td>
                      <td>4 months</td>
                      <td>21 Aug, Thursday</td>
                      <td>10 years</td>
                      <td>₹ 3000</td>
                    </tr>
                    <tr>
                      <td>
                         <Link href="/tutor-details" className='student-img-name d-flex align-items-center gap-2'>
                            <Image src={Student01} alt="" />
                            <span className='name'>Mabel Mueller</span>
                        </Link>
                      </td>
                      <td>Guitar</td>
                      <td>3 months</td>
                      <td>22 Aug, Thursday</td>
                      <td>6 years</td>
                      <td>₹ 5000</td>
                    </tr>
                    <tr>
                      <td>
                         <Link href="/tutor-details" className='student-img-name d-flex align-items-center gap-2'>
                            <Image src={Student01} alt="" />
                            <span className='name'>Mabel Mueller</span>
                        </Link>
                      </td>
                      <td>Drum</td>
                      <td>6 months</td>
                      <td>23 Aug, Thursday</td>
                      <td>3 years</td>
                      <td>₹ 8000</td>
                    </tr>
                    <tr>
                      <td>
                         <Link href="/tutor-details" className='student-img-name d-flex align-items-center gap-2'>
                            <Image src={Student01} alt="" />
                            <span className='name'>Mabel Mueller</span>
                        </Link>
                      </td>
                      <td>Piano</td>
                      <td>4 months</td>
                      <td>21 Aug, Thursday</td>
                      <td>10 years</td>
                      <td>₹ 3000</td>
                    </tr>
                    <tr>
                      <td>
                         <Link href="/tutor-details" className='student-img-name d-flex align-items-center gap-2'>
                            <Image src={Student01} alt="" />
                            <span className='name'>Mabel Mueller</span>
                        </Link>
                      </td>
                      <td>Piano</td>
                      <td>4 months</td>
                      <td>21 Aug, Thursday</td>
                      <td>10 years</td>
                      <td>₹ 3000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            <div className='pagination-sec d-flex align-items-center justify-content-center mt-4'>
                <Pagination>
                    <Pagination.Prev />
                    <Pagination.Item active>{1}</Pagination.Item>
                    <Pagination.Item>{2}</Pagination.Item>
                    <Pagination.Item>{3}</Pagination.Item>
                    <Pagination.Ellipsis />
                    <Pagination.Item>{99}</Pagination.Item>
                    <Pagination.Next />
                </Pagination>
            </div>
        </div>
    </div>
    {/* <AddNewStudentModal />
    <AddNewCourseModal /> */}
    </div>
  )
}

export default MyTutorList