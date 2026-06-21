const BASE_URL = 'http://localhost:5001/api';

async function verify() {
  console.log('=== FULL LIFECYCLE VERIFICATION OF NEW FIXES ===');

  // 1. Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@schoolerp.com', password: 'admin123' })
  });

  if (!loginRes.ok) {
    console.error('Admin Login failed', await loginRes.text());
    return;
  }

  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('[✓] Admin Login successful.');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  let tempTeacherId = null;
  let tempStudentId = null;
  let tempInvoiceId = null;

  try {
    // 2. Test Teacher Name Sync & Verification
    console.log('\n--- Test 1: Creating Teacher and verifying direct name field ---');
    const teacherPayload = {
      name: 'Dr. Ramesh Kumar',
      email: 'ramesh.kumar@schoolerp.com',
      password: 'teacherpassword',
      phone: '+91 99887 76655',
      role: 'teacher',
      teacherInfo: {
        qualification: 'Ph.D. in Mathematics',
        salary: 60000,
        subjects: ['Mathematics']
      }
    };

    const createTeacherRes = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(teacherPayload)
    });

    if (createTeacherRes.ok) {
      const createdTeacher = await createTeacherRes.json();
      tempTeacherId = createdTeacher._id;
      console.log(`[✓] Teacher created successfully. User ID: ${tempTeacherId}`);

      // Now query teachers list
      const teachersListRes = await fetch(`${BASE_URL}/admin/users?role=teacher`, { headers });
      const teachersList = await teachersListRes.json();
      const verifiedTeacher = teachersList.find(t => t._id === tempTeacherId);
      if (verifiedTeacher && verifiedTeacher.name === 'Dr. Ramesh Kumar') {
        console.log('[✓] Verified teacher name is correctly retrieved and synced.');
      } else {
        console.error('[✗] Teacher name mismatch or missing:', verifiedTeacher);
      }
    } else {
      console.error('[✗] Failed to create teacher:', await createTeacherRes.text());
    }

    // 3. Test Student Grade Class & Section Select & Fees populate
    console.log('\n--- Test 2: Creating Student & Generating Invoice to verify Class/Section Filtering ---');
    
    // Fetch classes to assign
    const classesRes = await fetch(`${BASE_URL}/admin/classes`, { headers });
    const classes = await classesRes.json();
    if (classes.length > 0) {
      const targetClass = classes[0];
      console.log(`Using class: ${targetClass.name} (${targetClass._id})`);

      const studentPayload = {
        name: 'Suresh Patel',
        email: 'suresh.patel@schoolerp.com',
        password: 'studentpassword',
        phone: '+91 88776 65544',
        role: 'student',
        studentInfo: {
          rollNumber: 'PATEL-101',
          classId: targetClass._id,
          section: 'B', // Using section B
          parentEmail: 'parent.patel@gmail.com'
        }
      };

      const createStudentRes = await fetch(`${BASE_URL}/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(studentPayload)
      });

      if (createStudentRes.ok) {
        const createdStudent = await createStudentRes.json();
        tempStudentId = createdStudent._id;
        console.log(`[✓] Student created successfully. User ID: ${tempStudentId}`);

        // Now create a fee invoice for this student
        console.log('Generating Tuition Fee invoice for this student...');
        const invoicePayload = {
          studentId: tempStudentId,
          title: 'Tuition Fee Q2',
          amount: 1500,
          dueDate: '2026-09-30'
        };

        const createInvoiceRes = await fetch(`${BASE_URL}/admin/fees`, {
          method: 'POST',
          headers,
          body: JSON.stringify(invoicePayload)
        });

        if (createInvoiceRes.ok) {
          const createdInvoice = await createInvoiceRes.json();
          tempInvoiceId = createdInvoice._id;
          console.log(`[✓] Invoice generated successfully. Invoice ID: ${tempInvoiceId}`);

          // Query invoices and inspect details
          const invoicesRes = await fetch(`${BASE_URL}/admin/fees`, { headers });
          const invoices = await invoicesRes.json();
          const targetInvoice = invoices.find(inv => inv._id === tempInvoiceId);

          if (targetInvoice && targetInvoice.student?.studentInfo) {
            const sInfo = targetInvoice.student.studentInfo;
            console.log(`[✓] Invoice retrieved. Student ClassId: "${sInfo.classId}", Section: "${sInfo.section}"`);
            if (sInfo.classId === targetClass._id && sInfo.section === 'B') {
              console.log('[✓] Successful classId and section population inside fee register query!');
            } else {
              console.error('[✗] ClassId or Section populated incorrectly:', sInfo);
            }
          } else {
            console.error('[✗] Generated invoice not found or missing student details.');
          }
        } else {
          console.error('[✗] Failed to generate invoice:', await createInvoiceRes.text());
        }
      } else {
        console.error('[✗] Failed to create student:', await createStudentRes.text());
      }
    } else {
      console.warn('No classes found in DB. Skipping Student & Fees checks.');
    }

    // 4. Test Vehicle Number Validation
    console.log('\n--- Test 3: Vehicle number registration checks ---');
    const testNumber = `GJ-01-XX-${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(`Registering vehicle with format: ${testNumber}...`);
    const validVehicleRes = await fetch(`${BASE_URL}/resources/transport`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        vehicleNumber: testNumber,
        model: 'Tata Marcopolo Bus',
        capacity: 50,
        driverName: 'Mohan Lal',
        driverPhone: '9988009988',
        driverLicense: 'LIC998877',
        routeName: 'Route A',
        routeDetails: {
          routeName: 'Route A',
          pickupPoints: ['Stop 1', 'Stop 2'],
          startLocation: 'RTO Office',
          endLocation: 'School Campus'
        }
      })
    });

    if (validVehicleRes.ok) {
      const validVehicle = await validVehicleRes.json();
      console.log(`[✓] Successfully registered vehicle: ${validVehicle.vehicleNumber}`);
      
      // Delete vehicle
      console.log(`Deleting test vehicle ${validVehicle._id}...`);
      const delVeh = await fetch(`${BASE_URL}/resources/transport/${validVehicle._id}`, {
        method: 'DELETE',
        headers
      });
      console.log('Delete vehicle status:', delVeh.status);
    } else {
      console.error('Failed to register valid vehicle format:', await validVehicleRes.text());
    }

  } catch (err) {
    console.error('Error during lifecycle check:', err.message);
  } finally {
    // 5. Cleanup
    console.log('\n--- Clean up temporary records ---');
    if (tempInvoiceId) {
      // Note: No delete invoice route is available in feeRoutes.js, we can leave it since it is mapped to a deleted student user.
      console.log('Temporary invoices are automatically orphaned or handled.');
    }
    if (tempStudentId) {
      console.log(`Deleting temporary student ${tempStudentId}...`);
      const delStudentRes = await fetch(`${BASE_URL}/admin/users/${tempStudentId}`, {
        method: 'DELETE',
        headers
      });
      console.log('Delete student status:', delStudentRes.status, await delStudentRes.text());
    }
    if (tempTeacherId) {
      console.log(`Deleting temporary teacher ${tempTeacherId}...`);
      const delTeacherRes = await fetch(`${BASE_URL}/admin/users/${tempTeacherId}`, {
        method: 'DELETE',
        headers
      });
      console.log('Delete teacher status:', delTeacherRes.status, await delTeacherRes.text());
    }
    console.log('=== VERIFICATION COMPLETED ===');
  }
}

verify();
