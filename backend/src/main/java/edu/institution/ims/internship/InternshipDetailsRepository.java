package edu.institution.ims.internship;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InternshipDetailsRepository extends JpaRepository<InternshipDetails, Long> {
    Optional<InternshipDetails> findByOnboardingStudentId(Long studentId);
    Optional<InternshipDetails> findByOnboardingId(Long onboardingId);
    boolean existsByOnboardingId(Long onboardingId);
}
