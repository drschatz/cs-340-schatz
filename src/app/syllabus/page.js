'use client';

import React from 'react';

export default function SyllabusPage() {
  const navItems = [
    { label: 'Home', color: '#fff8e5', group: 1, href: '/' },
    { label: 'Syllabus', color: '#fff8e5', group: 1, href: '/syllabus' },
    { label: 'Staff', color: '#fff8e5', group: 1, href: '/staff' },
    { label: 'Content', color: '#fff8e5', group: 1, href: '/content' },
    { label: 'MPs', color: '#fff8e5', group: 1, href: '/mps' },
    { label: 'PraireLearn', color: '#fce8d0', group: 2, href: '/prairielearn' },
    { label: 'Campuswire', color: '#dbeafe', group: 3, href: '/campuswire' }
  ];

  const tableOfContents = [
    { 
      number: 1, 
      title: 'Course Staff', 
      id: 'course-staff',
      subsections: [
        { label: 'Instructors', id: 'instructors' },
        { label: 'Staff', id: 'staff' }
      ] 
    },
    { 
      number: 2, 
      title: 'Course Structure', 
      id: 'course-structure',
      subsections: [
        { label: 'Overview', id: 'overview' },
        { label: 'Related Courses', id: 'related-courses' }
      ] 
    },
    { 
      number: 3, 
      title: 'Class Meetings', 
      id: 'class-meetings',
      subsections: [
        { label: 'Schedule', id: 'schedule' },
        { label: 'Absences', id: 'absences' },
        { label: 'Tutoring Hours', id: 'tutoring-hours' }
      ] 
    },
    { 
      number: 4, 
      title: 'Assignments and Grades', 
      id: 'assignments-grades',
      subsections: [
        { label: 'Grading Categories', id: 'grading-categories' },
        { label: 'Letter Grades', id: 'letter-grades' },
        { label: 'Homework Replacement Policy', id: 'homework-replacement' }
      ] 
    },
    { 
      number: 5, 
      title: 'MP Policies', 
      id: 'mp-policies',
      subsections: [
        { label: 'Guidelines', id: 'mp-guidelines' },
        { label: 'Timeliness and Deadlines', id: 'deadlines' }
      ] 
    },
    { 
      number: 6, 
      title: 'Computer-Based Testing Facility', 
      id: 'cbtf',
      subsections: [
        { label: 'CBTF Policies', id: 'cbtf-policies' },
        { label: 'Accommodations', id: 'accommodations' }
      ] 
    },
    { 
      number: 7, 
      title: 'Academic Integrity', 
      id: 'academic-integrity',
      subsections: [
        { label: 'Collaboration', id: 'collaboration' },
        { label: 'AI Policy', id: 'ai-policy' },
        { label: 'Consequences', id: 'consequences' }
      ] 
    },
    { 
      number: 8, 
      title: 'Campus Resources', 
      id: 'campus-resources',
      subsections: [
        { label: 'Mental Health', id: 'mental-health' },
        { label: 'DRES', id: 'dres' },
        { label: 'Anti-Racism', id: 'anti-racism' },
        { label: 'Community of Care', id: 'community-care' },
        { label: 'FERPA', id: 'ferpa' }
      ] 
    }
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    nav: {
      backgroundColor: 'transparent',
      borderBottom: 'none',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0px'
    },
    navGroup: {
      display: 'flex',
      gap: '0px'
    },
    navGroupSpacer: {
      width: '16px'
    },
    navButton: (color, isFirstInGroup, isLastInGroup) => ({
      padding: '8px 16px',
      borderRadius: isFirstInGroup && isLastInGroup ? '8px' : isFirstInGroup ? '8px 0 0 8px' : isLastInGroup ? '0 8px 8px 0' : '0px',
      border: 'none',
      backgroundColor: color || 'transparent',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px',
      textDecoration: 'none',
      color: 'inherit',
      display: 'inline-block'
    }),
    mainContent: {
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '32px',
      display: 'flex',
      gap: '80px',
      alignItems: 'flex-start'
    },
    sidebar: {
      flex: '0 0 240px',
      backgroundColor: '#fff8e5',
      borderRadius: '16px',
      padding: '20px',
      height: 'fit-content',
      position: 'sticky',
      top: '32px'
    },
    content: {
      flex: '1',
      maxWidth: '800px'
    },
    sidebarTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px'
    },
    tocItem: {
      marginBottom: '16px'
    },
    tocTitle: {
      fontWeight: '600',
      marginBottom: '6px'
    },
    tocLink: {
      textDecoration: 'none',
      color: 'inherit',
      cursor: 'pointer'
    },
    tocSubsection: {
      fontSize: '14px',
      marginLeft: '16px',
      marginTop: '4px'
    },
    content: {
      flex: 1
    },
    title: {
      fontSize: '48px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '32px',
      position: 'relative',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)'
    },
    section: {
      marginBottom: '48px',
      scrollMarginTop: '32px'
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px',
      marginBottom: '16px'
    },
    sectionNumber: {
      fontSize: '32px',
      fontWeight: 'bold'
    },
    sectionTitle: {
      fontSize: '32px',
      fontWeight: 'bold'
    },
    subsection: {
      marginBottom: '24px',
      scrollMarginTop: '32px'
    },
    subsectionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '12px'
    },
    paragraph: {
      fontSize: '16px',
      lineHeight: '1.6',
      marginBottom: '12px'
    },
    list: {
      marginLeft: '24px',
      marginBottom: '12px'
    },
    listItem: {
      marginBottom: '8px',
      lineHeight: '1.6'
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navGroup}>
          {navItems.filter(item => item.group === 1).map((item, i) => {
            const groupItems = navItems.filter(it => it.group === 1);
            const isFirstInGroup = i === 0;
            const isLastInGroup = i === groupItems.length - 1;
            return (
              <a
                key={item.label}
                href={item.href}
                style={styles.navButton(item.color, isFirstInGroup, isLastInGroup)}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <div style={styles.navGroupSpacer} />
        <div style={styles.navGroup}>
          {navItems.filter(item => item.group === 2).map((item, i) => {
            const groupItems = navItems.filter(it => it.group === 2);
            const isFirstInGroup = i === 0;
            const isLastInGroup = i === groupItems.length - 1;
            return (
              <a
                key={item.label}
                href={item.href}
                style={styles.navButton(item.color, isFirstInGroup, isLastInGroup)}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <div style={styles.navGroupSpacer} />
        <div style={styles.navGroup}>
          {navItems.filter(item => item.group === 3).map((item, i) => {
            const groupItems = navItems.filter(it => it.group === 3);
            const isFirstInGroup = i === 0;
            const isLastInGroup = i === groupItems.length - 1;
            return (
              <a
                key={item.label}
                href={item.href}
                style={styles.navButton(item.color, isFirstInGroup, isLastInGroup)}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Table of Contents Sidebar */}
        <aside style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>Table of Contents</h2>
          {tableOfContents.map((item, i) => (
            <div key={i} style={styles.tocItem}>
              <a href={`#${item.id}`} style={styles.tocLink}>
                <div style={styles.tocTitle}>
                  {item.number}. {item.title}
                </div>
              </a>
              {item.subsections.map((sub, j) => (
                <a key={j} href={`#${sub.id}`} style={styles.tocLink}>
                  <div style={styles.tocSubsection}>
                    {sub.label}
                  </div>
                </a>
              ))}
            </div>
          ))}
        </aside>

        {/* Content */}
        <main style={styles.content}>
          <h1 style={styles.title}>Syllabus</h1>

          {/* Course Description */}
          <div style={styles.section}>
            <p style={styles.paragraph}>
              <strong>CS 340: Introduction to Computer Systems</strong>
            </p>
            <p style={styles.paragraph}>
              Basics of computer systems. Number representations, assembly/machine language, abstract models of processors (fetch/execute, memory hierarchy), processes/process control, simple memory management, file I/O and directories, network programming, usage of cloud services.
            </p>
            <p style={styles.paragraph}>
              3 credit hours. Prerequisites: CS 225
            </p>
          </div>

          {/* 1. Course Staff */}
          <div id="course-staff" style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNumber}>1.</span>
              <span style={styles.sectionTitle}>Course Staff</span>
            </div>

            <div id="instructors" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Instructors</h3>
              <p style={styles.paragraph}>
                Jule Schatz (drschatz) (2330 SC) and Luther Tychonievich (luthert) (2340 SC).
              </p>
              <p style={styles.paragraph}>
                Please send an email to BOTH instructors with 340 in the subject line if you need individual accommodations.
              </p>
            </div>

            <div id="staff" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Staff</h3>
              <p style={styles.paragraph}>
                Roma Chandra, Daixuan Li, Janice Mei, Otto Piramuthu, Michelle Ru, Kavya Sachdeva, Frank Schmidt, Arunima Suri, Nick Tetreault, Andrea Watkins, and Sarah Xu.
              </p>
              <p style={styles.paragraph}>
                To contact staff or ask course-related questions, please post on Campuswire.
              </p>
            </div>
          </div>

          {/* 2. Course Structure */}
          <div id="course-structure" style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNumber}>2.</span>
              <span style={styles.sectionTitle}>Course Structure</span>
            </div>

            <div id="overview" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Overview</h3>
              <p style={styles.paragraph}>
                CS 340 meets twice a week for in-person lectures. Each week you will have a mastery-based homework that allows you to practice and master the technical concepts. After mastering the concepts, you then apply them in the weekly assignments (MPs).
              </p>
              <p style={styles.paragraph}>
                Throughout the semester, you will:
              </p>
              <ul style={styles.list}>
                <li style={styles.listItem}>Learn how computers do what they do</li>
                <li style={styles.listItem}>Implement real technical specifications, including portions of the PNG and HTTP specifications</li>
                <li style={styles.listItem}>Implement blocking calls with various locking mechanisms</li>
                <li style={styles.listItem}>Communicate with web-based APIs for real-time interactive applications</li>
                <li style={styles.listItem}>Write your own RESTful and stateful API endpoints</li>
                <li style={styles.listItem}>Combine everything into a final course project</li>
              </ul>
              <p style={styles.paragraph}>
                The course will be roughly divided into two parts. Part 1 covers how computers are designed and operate, from electrons up to C. This part also covers concurrency and synchronization, including the basics of operating systems and threads. Part 2 covers interaction between systems written by different parties, including various "as a Service" models such as containerization and web services.
              </p>
            </div>

            <div id="related-courses" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Related Courses</h3>
              <p style={styles.paragraph}>
                This course has significant overlap with CS 233 and CS 341. CS 233 and CS 341 invest 8 credit hours in going into detail on topics that CS 340 covers in 2 credit hours. Our briefer overview is sufficient for many purposes, but leaves out details needed for hardware-aware application domains such as embedded systems and cybersecurity. The remaining credit hour in 340 explores how to use containers and service architectures to deploy internet applications.
              </p>
            </div>
          </div>

          {/* 3. Class Meetings */}
          <div id="class-meetings" style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNumber}>3.</span>
              <span style={styles.sectionTitle}>Class Meetings</span>
            </div>

            <div id="schedule" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Schedule</h3>
              <p style={styles.paragraph}>
                Class meets each Tuesday and Thursday from 2:00PM - 3:15PM in room 2079 in the Natural History Building.
              </p>
              <p style={styles.paragraph}>
                All lectures are recorded and posted on MediaSpace.
              </p>
            </div>

            <div id="absences" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Absences</h3>
              <p style={styles.paragraph}>
                For most class meetings, absences are permitted at no penalty and require no notice. Please do not attend class meetings if you are feeling ill.
              </p>
              <p style={styles.paragraph}>
                For the following, if you cannot make it, please let an instructor know as soon as possible. We will evaluate each situation on a case-by-case basis:
              </p>
              <ul style={styles.list}>
                <li style={styles.listItem}>The three exams (in the CBTF)</li>
                <li style={styles.listItem}>The MP9 checkoff (Nov 20th during class)</li>
                <li style={styles.listItem}>The final project checkoff (Dec 16th 7pm)</li>
              </ul>
              <p style={styles.paragraph}>
                Examples of common reasons for an excused absence include potentially contagious illness, episodic disability, university-sponsored travel, personal or family emergencies, or major religious observances.
              </p>
            </div>

            <div id="tutoring-hours" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Tutoring Hours</h3>
              <p style={styles.paragraph}>
                See the schedule for when and where tutoring hours take place. One-off adjustments based on tutor availability may be announced on Campuswire.
              </p>
              <p style={styles.paragraph}>
                Tutoring hours are a place to receive help on misunderstandings, MPs, and homeworks. Additionally, it's a great place to meet classmates and staff! Feel free to stop by even if you don't have a specific question.
              </p>
            </div>
          </div>

          {/* 4. Assignments and Grades */}
          <div id="assignments-grades" style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNumber}>4.</span>
              <span style={styles.sectionTitle}>Assignments and Grades</span>
            </div>

            <div id="grading-categories" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Grading Categories</h3>
              <ul style={styles.list}>
                <li style={styles.listItem}><strong>Homework Assignments:</strong> 10% of course grade. Given weekly in PrairieLearn.</li>
                <li style={styles.listItem}><strong>In-class Exercises:</strong> 0.05% extra credit per class period. Must be completed in-person.</li>
                <li style={styles.listItem}><strong>Exams:</strong> 45% of course grade (15% each). Given in the CBTF, 50 minutes each, scheduled for ONE day (always a Tuesday). The Tuesday class session will be canceled for the week of each exam.</li>
                <li style={styles.listItem}><strong>Machine Projects (MPs and Final Project):</strong> 45% of course grade. Roughly one per week, though some weeks won't have one. Most MPs are submitted on our class submission page, with one MP requiring a tutoring hours check-off, and one MP having an in-class component. The final project will be checked off during the university-assigned finals period.</li>
              </ul>
            </div>

            <div id="letter-grades" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Letter Grades</h3>
              <p style={styles.paragraph}>
                Letter grades are based on a scale of percentages where 90s are As, 80s are Bs, 70s are Cs, and 60s are Ds. Pluses are given for the top third of each letter bucket and minuses for the bottom third. A+ will be given to a small number of the very best performers in the class.
              </p>
              <p style={styles.paragraph}>
                Some MPs will include extra credit opportunities which will be clearly indicated and awarded only if you got 100% on the rest of the MP.
              </p>
            </div>

            <div id="homework-replacement" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Homework Replacement Policy</h3>
              <p style={styles.paragraph}>
                Each exam will replace a preceding, relevant, homework score (if it would improve your grade). For example, let's say HW 1, 2, and 3 are tested on exam 1. If you get a higher score on exam 1 than on HW 2, HW 2's score is replaced with your exam score. For exam 2, the only relevant HW scores are the ones after exam 1 but before exam 2. For exam 3, the only relevant HW scores are ones after exam 1 and exam 2 but before exam 3.
              </p>
            </div>
          </div>

          {/* 5. MP Policies */}
          <div id="mp-policies" style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNumber}>5.</span>
              <span style={styles.sectionTitle}>MP Policies</span>
            </div>

            <div id="mp-guidelines" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Guidelines</h3>
              <p style={styles.paragraph}>
                Many of the MPs are challenging. Expect to invest significant time over several days for each MP.
              </p>
              <p style={styles.paragraph}>
                Our goal with each MP is to give you hands on practice with the material covered in lecture. It is not to give us working code, nor learn by looking at working code.
              </p>
              <p style={styles.paragraph}>
                This leads to the following concrete policies:
              </p>
              <ul style={styles.list}>
                <li style={styles.listItem}><strong>Attend lecture before coding.</strong> Lecture often includes MP-related content. Please review that prior to asking for help.</li>
                <li style={styles.listItem}><strong>Design and type all your own code.</strong> Search engines, AI systems, tutors, and friends are not permitted sources of MP code.</li>
                <li style={styles.listItem}><strong>Share tips, not steps.</strong> It is helpful to share tips like "fseek is helpful." It is harmful to share steps like "add a for loop that uses fread with a 4 byte buffer, converts to an int, and then fseeks that far." Figuring out the steps yourself is part of your learning experience.</li>
                <li style={styles.listItem}><strong>Always use a debugger.</strong> MP1 shows you how to use a debugger. For each subsequent MP, if your code is not doing what you expected it to do, run it in the debugger to see how it is doing the wrong thing.</li>
                <li style={styles.listItem}><strong>If you need help, come to tutoring hours!</strong></li>
              </ul>
            </div>

            <div id="deadlines" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Timeliness and Deadlines</h3>
              <p style={styles.paragraph}>
                Deadlines matter, but life also happens! We have 3 policies around deadlines:
              </p>
              <ul style={styles.list}>
                <li style={styles.listItem}>If you miss an MP deadline by 24 hours or less, submit anyway. We'll note that you were late but won't dock your GPA. However, course staff will not be able to help you with the MP past the posted deadline.</li>
                <li style={styles.listItem}>For homework, exams, and in-class checkoffs we do not accept late work.</li>
                <li style={styles.listItem}>The professors may approve exceptions to these rules via email in cases of extenuating circumstances. Please contact the professors as soon as possible for full consideration.</li>
              </ul>
            </div>
          </div>

          {/* 6. CBTF */}
          <div id="cbtf" style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNumber}>6.</span>
              <span style={styles.sectionTitle}>Computer-Based Testing Facility</span>
            </div>

            <div id="cbtf-policies" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>CBTF Policies</h3>
              <p style={styles.paragraph}>
                This course uses the Grainger College of Engineering's Computer-Based Testing Facility for its exams. This course offering has a SINGLE day to take each exam, NOT a 3-day window. Each exam is scheduled for a Tuesday and that corresponding Tuesday class is cancelled.
              </p>
              <p style={styles.paragraph}>
                The policies of the CBTF are the policies of this course. If you have any issue during an exam, inform the proctor immediately. Take the CBTF Orientation (10 minutes) and review all instructions before your first exam.
              </p>
            </div>

            <div id="accommodations" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Accommodations</h3>
              <p style={styles.paragraph}>
                If you have accommodations identified by DRES for exams, please submit your Letter of Accommodations (LOA) through the CBTF website as soon as possible. It can take up to five days for your LOA to be processed. This must be done each semester you use the CBTF.
              </p>
            </div>
          </div>

          {/* 7. Academic Integrity */}
          <div id="academic-integrity" style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNumber}>7.</span>
              <span style={styles.sectionTitle}>Academic Integrity</span>
            </div>

            <div id="collaboration" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Collaboration</h3>
              <p style={styles.paragraph}>
                Collaboration includes giving or receiving information from others, including AI systems, websites, tutors, or other students.
              </p>
              <ul style={styles.list}>
                <li style={styles.listItem}>Homework and in-class collaboration is permitted provided each student can explain their correct answers.</li>
                <li style={styles.listItem}>Exam collaboration is not permitted.</li>
                <li style={styles.listItem}>MP collaboration is not permitted if it involves giving or receiving full or partial solutions. MP collaboration that does not share solutions is permitted if it focuses on shared learning.</li>
              </ul>
            </div>

            <div id="ai-policy" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>AI Policy</h3>
              <p style={styles.paragraph}>
                <strong>You cannot use AI to write code for you or give you direct answers.</strong>
              </p>
              <p style={styles.paragraph}>
                AI is a great tool for searching documentation on unfamiliar libraries. Queries like "how do I download a webpage using aiohttp" are likely to provide useful information.
              </p>
              <p style={styles.paragraph}>
                In Spring 2024, most student queries to AI beyond this yielded incorrect and confusing information. When asked for MP solutions, AI provided code with problematic approaches that were almost impossible to fix. Students who used AIs in these ways earned two letter-grade steps below the class average.
              </p>
              <p style={styles.paragraph}>
                Don't engage in prohibited collaboration with AI, and be cautious in permitted collaboration. If it's not aligning with class discussions, seek human help instead.
              </p>
            </div>

            <div id="consequences" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Consequences</h3>
              <p style={styles.paragraph}>
                If a student is detected engaging in academic dishonesty:
              </p>
              <ul style={styles.list}>
                <li style={styles.listItem}>The case will be brought to the college's academic integrity process</li>
                <li style={styles.listItem}>All points will be lost on the assignment</li>
                <li style={styles.listItem}>All extra credit will be removed</li>
                <li style={styles.listItem}>The final course grade will be lowered by one whole letter grade (10 percentage points)</li>
              </ul>
              <p style={styles.paragraph}>
                A second incident, or any cheating on an exam, results in an automatic F in the course.
              </p>
            </div>
          </div>

          {/* 8. Campus Resources */}
          <div id="campus-resources" style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNumber}>8.</span>
              <span style={styles.sectionTitle}>Campus Resources</span>
            </div>

            <div id="mental-health" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Mental Health</h3>
              <p style={styles.paragraph}>
                The University of Illinois offers a variety of confidential services including individual and group counseling, crisis intervention, psychiatric services, and specialized screenings which are covered through the Student Health Fee.
              </p>
              <ul style={styles.list}>
                <li style={styles.listItem}>Counseling Center: (217) 333-3704, 610 East John Street</li>
                <li style={styles.listItem}>McKinley Health Center: (217) 333-2700, 1109 South Lincoln Avenue</li>
                <li style={styles.listItem}>National Suicide Prevention Lifeline: (800) 273-8255</li>
                <li style={styles.listItem}>Rosecrance Crisis Line: (217) 359-4141 (24/7)</li>
              </ul>
            </div>

            <div id="dres" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>DRES</h3>
              <p style={styles.paragraph}>
                To obtain disability-related academic adjustments and/or auxiliary aids, students with disabilities must contact the course instructors and DRES as soon as possible. Contact DRES at 1207 S. Oak St., call 217-333-4603, email disability@illinois.edu, or visit their website.
              </p>
            </div>

            <div id="anti-racism" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Anti-Racism</h3>
              <p style={styles.paragraph}>
                The Grainger College of Engineering is committed to the creation of an anti-racist, inclusive community that welcomes diversity. Everyone is expected to help establish and maintain an environment where students, staff, and faculty can contribute without fear of personal ridicule, or intolerant or offensive language.
              </p>
            </div>

            <div id="community-care" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>Community of Care</h3>
              <p style={styles.paragraph}>
                As members of the Illinois community, we each have a responsibility to express care and concern for one another. If you come across a classmate whose behavior concerns you, refer this behavior to the Student Assistance Center (217-333-0050).
              </p>
            </div>

            <div id="ferpa" style={styles.subsection}>
              <h3 style={styles.subsectionTitle}>FERPA</h3>
              <p style={styles.paragraph}>
                Any student who has suppressed their directory information pursuant to FERPA should self-identify to the instructors to ensure protection of the privacy of their attendance in this course.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}