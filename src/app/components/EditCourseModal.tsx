"use client";
import React, { useState, useEffect } from "react";
import { Form, Modal, Button } from "react-bootstrap";
import "./AddAssignmentsModal.css";

interface CurriculumItem {
  sessionNo: string | number;
  topic: string;
  tangibleOutcome: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  curriculum: {
    sessionNo: string | number;
    topic: string;
    tangibleOutcome: string;
  }[];
  category?: string;
}

interface EditCourseModalProps {
  show: boolean;
  onHide: () => void;
  course: Course | null;
  onUpdate: (updatedCourse: Course) => void; // Callback to update the course in the parent
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({
  show,
  onHide,
  course,
  onUpdate,
}) => {
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    duration: "",
    price: "",
    curriculum: [],
  });

  useEffect(() => {
    if (course) {
      setForm({
        title: course.title || "",
        category: course.category || "Music",
        description: course.description || "",
        duration: course.duration || "",
        price: course.price ? String(course.price) : "",
        curriculum: course.curriculum ? [...course.curriculum] : [],
      });
    }
  }, [course]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleCurriculumChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newCurriculum = [...form.curriculum];
    newCurriculum[index] = { ...newCurriculum[index], [name]: value };
    setForm((prevForm) => ({
      ...prevForm,
      curriculum: newCurriculum,
    }));
  };

  const addCurriculumItem = () => {
    setForm((prevForm) => ({
      ...prevForm,
      curriculum: [
        ...prevForm.curriculum,
        {
          sessionNo: prevForm.curriculum.length + 1,
          topic: "",
          tangibleOutcome: "",
        },
      ],
    }));
  };

  const removeCurriculumItem = (index: number) => {
    const newCurriculum = form.curriculum.filter((_, i) => i !== index);
    // Re-number sessions
    const renumberedCurriculum = newCurriculum.map((item, i) => ({
      ...item,
      sessionNo: i + 1,
    }));
    setForm((prevForm) => ({
      ...prevForm,
      curriculum: renumberedCurriculum,
    }));
  };

  const handleUpdate = () => {
    if (course) {
      const updatedCourseData = {
        ...course,
        ...form,
        price: Number(form.price) || 0,
      };
      onUpdate(updatedCourseData);
    }
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="w-1000"
      className="modal-common-sec assignment-modal-sec"
    >
      <Modal.Header closeButton>
        <Button
          variant="link"
          className="modal-close-btn"
          onClick={onHide}
          aria-label="Close"
          style={{ position: "absolute", right: 16, top: 16, zIndex: 2 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M6 6L18 18"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </Button>
      </Modal.Header>
      <Modal.Body>
        <div className="head-modal text-center">
          <h2>Edit Course</h2>
          <p>
            Edit the course details below to update content & other information.
          </p>
        </div>

        <div className="form-box-modal label-strong-box">
          <Form>
            <div className="row">
              <div className="col-md-12">
                <Form.Group className="mb-3">
                  <Form.Label className="w-100 d-block">
                    Course Title
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Introduction to Piano"
                  />
                </Form.Group>
              </div>

              <div className="col-md-12">
                <div className="select-box">
                  <Form.Group className="mb-3">
                    <Form.Label className="w-100 d-block">
                      Course Category
                    </Form.Label>
                    <Form.Select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      <option>Music</option>
                      <option>Art</option>
                      <option>Dance</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              <div className="col-md-12">
                <Form.Group className="mb-3">
                  <Form.Label className="w-100 d-block">
                    Course Description
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Learn the fundamentals of piano playing..."
                  />
                </Form.Group>
              </div>

              <div className="col-md-12">
                <Form.Group className="mb-3">
                  <Form.Label className="w-100 d-block">
                    Course Duration
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="4 weeks"
                  />
                </Form.Group>
              </div>

              <div className="col-md-12">
                <Form.Group className="mb-3">
                  <Form.Label className="w-100 d-block">Course Fees</Form.Label>
                  <Form.Control
                    type="text"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="600"
                  />
                </Form.Group>
              </div>

              <div className="col-md-12">
                <Form.Label className="w-100 d-block mb-2">
                  Curriculum
                </Form.Label>
                {form.curriculum.map((item, idx) => (
                  <div
                    className="row add-box-more align-items-center"
                    key={idx}
                  >
                    <div className="col-md-2 col-4">
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="text"
                          name="sessionNo"
                          value={String(item.sessionNo)}
                          readOnly
                          className="text-center"
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-5 col-8">
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="text"
                          name="topic"
                          value={item.topic}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleCurriculumChange(idx, e)
                          }
                          placeholder="Introduction to Piano"
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-4 col-9">
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="text"
                          name="tangibleOutcome"
                          value={item.tangibleOutcome}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleCurriculumChange(idx, e)
                          }
                          placeholder="Learning"
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-1 col-3">
                      <Button
                        variant="link"
                        className="btn-delete-list"
                        onClick={() => removeCurriculumItem(idx)}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.625 6.375C8.625 5.47989 8.98058 4.62145 9.61351 3.98851C10.2464 3.35558 11.1049 3 12 3C12.8951 3 13.7536 3.35558 14.3865 3.98851C15.0194 4.62145 15.375 5.47989 15.375 6.375M8.625 6.375H15.375M8.625 6.375H5.25M15.375 6.375H18.75M5.25 6.375H3M5.25 6.375V18.75C5.25 19.3467 5.48705 19.919 5.90901 20.341C6.33097 20.7629 6.90326 21 7.5 21H16.5C17.0967 21 17.669 20.7629 18.091 20.341C18.5129 19.919 18.75 19.3467 18.75 18.75V6.375M18.75 6.375H21"
                            stroke="#E53935"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="border"
                  className="fixed-width-box d-flex align-items-center justify-content-center gap-2 p-3"
                  onClick={addCurriculumItem}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.9987 8.66683H8.66537V12.0002C8.66537 12.3668 8.36537 12.6668 7.9987 12.6668C7.63203 12.6668 7.33203 12.3668 7.33203 12.0002V8.66683H3.9987C3.63203 8.66683 3.33203 8.36683 3.33203 8.00016C3.33203 7.6335 3.63203 7.3335 3.9987 7.3335H7.33203V4.00016C7.33203 3.6335 7.63203 3.3335 7.9987 3.3335C8.36537 3.3335 8.66537 3.6335 8.66537 4.00016V7.3335H11.9987C12.3654 7.3335 12.6654 7.6335 12.6654 8.00016C12.6654 8.36683 12.3654 8.66683 11.9987 8.66683Z"
                      fill="#6E09BD"
                    />
                  </svg>
                  <span>Add Lesson</span>
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" className="w-100" onClick={handleUpdate}>
          Update Course
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditCourseModal;
