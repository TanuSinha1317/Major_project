package edu.institution.ims.studentprofile;

import org.springframework.data.jpa.repository.*;
import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long>, JpaSpecificationExecutor<StudentProfile> {
    Optional<StudentProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    boolean existsByUidIgnoreCase(String uid);
    boolean existsByInstituteEmailIgnoreCase(String email);
    boolean existsByBranchAndAcademicYearAndRollNumberIgnoreCase(Branch branch, String academicYear, String rollNumber);
    boolean existsByUidIgnoreCaseAndIdNot(String uid, Long id);
    boolean existsByInstituteEmailIgnoreCaseAndIdNot(String email, Long id);
    boolean existsByBranchAndAcademicYearAndRollNumberIgnoreCaseAndIdNot(Branch branch, String academicYear, String rollNumber, Long id);
}
