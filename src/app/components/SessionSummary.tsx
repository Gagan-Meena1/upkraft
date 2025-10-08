"use client"

import React from 'react'
import { Button, Form } from 'react-bootstrap'
import Pagination from 'react-bootstrap/Pagination';
import Link from 'next/link';

const SessionSummary = () => {
  return (
     <div className='card-box'>
        <div className='library-list-sec'>
            <div className="head-com-sec d-flex align-items-center justify-content-between mb-4 gap-3 flex-xl-nowrap overflow-x-auto">
               <div className='left-head w-100'>
                    <h2 className='m-0'>Session Summary</h2>
               </div>
            </div>
            <div className='table-sec w-100 assignments-list-box'>
              <div className="table-responsive overflow-x-auto w-full">
                <table className="table align-middle m-0 min-w-[1600px]">
                  <thead>
                    <tr>
                      <th >Session Title</th>
                      <th >Date</th>
                      <th className='text-center'>Performance Score</th>
                      <th className='text-center'>Session Quality Score</th>
                      <th className='text-center'>Tutor CSAT </th>
                      <th className='text-center'>Assignment Completion Rate</th>
                      <th>Tutor Feedback / Remarks</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Keys & Notes Discovery</td>
                      <td>12 Aug 2025</td>
                      <td className='text-center'>5.6/<span>10</span></td>
                      <td className='text-center'>5.6/<span>10</span></td>
                      <td className='text-center'>Beginner</td>
                      <td className='text-center'>70%</td>
                      <td>Open chords, strumming patterns</td>
                      <td>
                        <Link href="/" className='btn btn-primary d-flex align-items-center gap-2 justify-content-center small'>
                            <span>Notify</span>
                            <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_558_33465)"><path d="M12.2139 0.5C12.251 0.500005 12.2759 0.507638 12.3125 0.543945L17.4541 5.66406C17.4907 5.70055 17.497 5.72472 17.4971 5.75977C17.4971 5.79486 17.4906 5.81903 17.4541 5.85547L12.3125 10.9756C12.2758 11.0121 12.251 11.0195 12.2139 11.0195C12.1767 11.0195 12.1519 11.0121 12.1152 10.9756C12.0785 10.939 12.0713 10.9151 12.0713 10.8799V7.82031H9.32227C8.65659 7.82031 8.05582 7.84064 7.52148 7.88184C6.98248 7.92339 6.44685 7.9972 5.91504 8.10449C5.37226 8.21402 4.8858 8.36709 4.46289 8.56836C4.04291 8.76825 3.65266 9.02537 3.29199 9.33691C2.91638 9.66138 2.60996 10.0468 2.37402 10.4902C2.1408 10.9286 1.96455 11.4352 1.83984 12.0029C1.71345 12.5784 1.65235 13.2186 1.65234 13.9199C1.65234 14.1728 1.66263 14.4437 1.67773 14.7324C0.876242 12.9156 0.503906 11.5346 0.503906 10.5596C0.503945 9.27391 0.675619 8.23084 1 7.41406C1.96598 5.02485 4.60827 3.7002 9.32227 3.7002H12.0713V0.639648C12.0713 0.604666 12.0786 0.580395 12.1152 0.543945C12.1518 0.507658 12.1768 0.5 12.2139 0.5Z" stroke="white"/></g><defs><clipPath id="clip0_558_33465"><rect width="18" height="16" fill="white"/></clipPath></defs></svg>
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      
                      <td>Keys & Notes Discovery</td>
                      <td>12 Aug 2025</td>
                      <td className='text-center'>5.6/<span>10</span></td>
                      <td className='text-center'>5.6/<span>10</span></td>
                      <td className='text-center'>Beginner</td>
                      <td className='text-center'>70%</td>
                      <td>Open chords, strumming patterns</td>
                      <td>
                        <Link href="/" className='btn btn-primary d-flex align-items-center gap-2 justify-content-center small'>
                            <span>Notify</span>
                            <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_558_33465)"><path d="M12.2139 0.5C12.251 0.500005 12.2759 0.507638 12.3125 0.543945L17.4541 5.66406C17.4907 5.70055 17.497 5.72472 17.4971 5.75977C17.4971 5.79486 17.4906 5.81903 17.4541 5.85547L12.3125 10.9756C12.2758 11.0121 12.251 11.0195 12.2139 11.0195C12.1767 11.0195 12.1519 11.0121 12.1152 10.9756C12.0785 10.939 12.0713 10.9151 12.0713 10.8799V7.82031H9.32227C8.65659 7.82031 8.05582 7.84064 7.52148 7.88184C6.98248 7.92339 6.44685 7.9972 5.91504 8.10449C5.37226 8.21402 4.8858 8.36709 4.46289 8.56836C4.04291 8.76825 3.65266 9.02537 3.29199 9.33691C2.91638 9.66138 2.60996 10.0468 2.37402 10.4902C2.1408 10.9286 1.96455 11.4352 1.83984 12.0029C1.71345 12.5784 1.65235 13.2186 1.65234 13.9199C1.65234 14.1728 1.66263 14.4437 1.67773 14.7324C0.876242 12.9156 0.503906 11.5346 0.503906 10.5596C0.503945 9.27391 0.675619 8.23084 1 7.41406C1.96598 5.02485 4.60827 3.7002 9.32227 3.7002H12.0713V0.639648C12.0713 0.604666 12.0786 0.580395 12.1152 0.543945C12.1518 0.507658 12.1768 0.5 12.2139 0.5Z" stroke="white"/></g><defs><clipPath id="clip0_558_33465"><rect width="18" height="16" fill="white"/></clipPath></defs></svg>
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      
                      <td>Keys & Notes Discovery</td>
                      <td>12 Aug 2025</td>
                      <td className='text-center'>5.6/<span>10</span></td>
                      <td className='text-center'>5.6/<span>10</span></td>
                      <td className='text-center'>Beginner</td>
                      <td className='text-center'>70%</td>
                      <td>Open chords, strumming patterns</td>
                      <td>
                        <Link href="/" className='btn btn-primary d-flex align-items-center gap-2 justify-content-center small'>
                            <span>Notify</span>
                            <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_558_33465)"><path d="M12.2139 0.5C12.251 0.500005 12.2759 0.507638 12.3125 0.543945L17.4541 5.66406C17.4907 5.70055 17.497 5.72472 17.4971 5.75977C17.4971 5.79486 17.4906 5.81903 17.4541 5.85547L12.3125 10.9756C12.2758 11.0121 12.251 11.0195 12.2139 11.0195C12.1767 11.0195 12.1519 11.0121 12.1152 10.9756C12.0785 10.939 12.0713 10.9151 12.0713 10.8799V7.82031H9.32227C8.65659 7.82031 8.05582 7.84064 7.52148 7.88184C6.98248 7.92339 6.44685 7.9972 5.91504 8.10449C5.37226 8.21402 4.8858 8.36709 4.46289 8.56836C4.04291 8.76825 3.65266 9.02537 3.29199 9.33691C2.91638 9.66138 2.60996 10.0468 2.37402 10.4902C2.1408 10.9286 1.96455 11.4352 1.83984 12.0029C1.71345 12.5784 1.65235 13.2186 1.65234 13.9199C1.65234 14.1728 1.66263 14.4437 1.67773 14.7324C0.876242 12.9156 0.503906 11.5346 0.503906 10.5596C0.503945 9.27391 0.675619 8.23084 1 7.41406C1.96598 5.02485 4.60827 3.7002 9.32227 3.7002H12.0713V0.639648C12.0713 0.604666 12.0786 0.580395 12.1152 0.543945C12.1518 0.507658 12.1768 0.5 12.2139 0.5Z" stroke="white"/></g><defs><clipPath id="clip0_558_33465"><rect width="18" height="16" fill="white"/></clipPath></defs></svg>
                        </Link>
                      </td>
                    </tr>
                    <tr>
                     
                      <td>Keys & Notes Discovery</td>
                      <td>12 Aug 2025</td>
                      <td className='text-center'>5.6/<span>10</span></td>
                      <td className='text-center'>5.6/<span>10</span></td>
                      <td className='text-center'>Beginner</td>
                      <td className='text-center'>70%</td>
                      <td>Open chords, strumming patterns</td>
                      <td>
                        <Link href="/" className='btn btn-primary d-flex align-items-center gap-2 justify-content-center small'>
                            <span>Notify</span>
                            <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_558_33465)"><path d="M12.2139 0.5C12.251 0.500005 12.2759 0.507638 12.3125 0.543945L17.4541 5.66406C17.4907 5.70055 17.497 5.72472 17.4971 5.75977C17.4971 5.79486 17.4906 5.81903 17.4541 5.85547L12.3125 10.9756C12.2758 11.0121 12.251 11.0195 12.2139 11.0195C12.1767 11.0195 12.1519 11.0121 12.1152 10.9756C12.0785 10.939 12.0713 10.9151 12.0713 10.8799V7.82031H9.32227C8.65659 7.82031 8.05582 7.84064 7.52148 7.88184C6.98248 7.92339 6.44685 7.9972 5.91504 8.10449C5.37226 8.21402 4.8858 8.36709 4.46289 8.56836C4.04291 8.76825 3.65266 9.02537 3.29199 9.33691C2.91638 9.66138 2.60996 10.0468 2.37402 10.4902C2.1408 10.9286 1.96455 11.4352 1.83984 12.0029C1.71345 12.5784 1.65235 13.2186 1.65234 13.9199C1.65234 14.1728 1.66263 14.4437 1.67773 14.7324C0.876242 12.9156 0.503906 11.5346 0.503906 10.5596C0.503945 9.27391 0.675619 8.23084 1 7.41406C1.96598 5.02485 4.60827 3.7002 9.32227 3.7002H12.0713V0.639648C12.0713 0.604666 12.0786 0.580395 12.1152 0.543945C12.1518 0.507658 12.1768 0.5 12.2139 0.5Z" stroke="white"/></g><defs><clipPath id="clip0_558_33465"><rect width="18" height="16" fill="white"/></clipPath></defs></svg>
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td>Keys & Notes Discovery</td>
                      <td>12 Aug 2025</td>
                      <td className='text-center'>5.6/<span>10</span></td>
                      <td className='text-center'>5.6/<span>10</span></td>
                      <td className='text-center'>Beginner</td>
                      <td className='text-center'>70%</td>
                      <td>Open chords, strumming patterns</td>
                      <td>
                        <Link href="/" className='btn btn-primary d-flex align-items-center gap-2 justify-content-center small'>
                            <span>Notify</span>
                            <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_558_33465)"><path d="M12.2139 0.5C12.251 0.500005 12.2759 0.507638 12.3125 0.543945L17.4541 5.66406C17.4907 5.70055 17.497 5.72472 17.4971 5.75977C17.4971 5.79486 17.4906 5.81903 17.4541 5.85547L12.3125 10.9756C12.2758 11.0121 12.251 11.0195 12.2139 11.0195C12.1767 11.0195 12.1519 11.0121 12.1152 10.9756C12.0785 10.939 12.0713 10.9151 12.0713 10.8799V7.82031H9.32227C8.65659 7.82031 8.05582 7.84064 7.52148 7.88184C6.98248 7.92339 6.44685 7.9972 5.91504 8.10449C5.37226 8.21402 4.8858 8.36709 4.46289 8.56836C4.04291 8.76825 3.65266 9.02537 3.29199 9.33691C2.91638 9.66138 2.60996 10.0468 2.37402 10.4902C2.1408 10.9286 1.96455 11.4352 1.83984 12.0029C1.71345 12.5784 1.65235 13.2186 1.65234 13.9199C1.65234 14.1728 1.66263 14.4437 1.67773 14.7324C0.876242 12.9156 0.503906 11.5346 0.503906 10.5596C0.503945 9.27391 0.675619 8.23084 1 7.41406C1.96598 5.02485 4.60827 3.7002 9.32227 3.7002H12.0713V0.639648C12.0713 0.604666 12.0786 0.580395 12.1152 0.543945C12.1518 0.507658 12.1768 0.5 12.2139 0.5Z" stroke="white"/></g><defs><clipPath id="clip0_558_33465"><rect width="18" height="16" fill="white"/></clipPath></defs></svg>
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
            </div>
          </div>
        </div>
  )
}

export default SessionSummary