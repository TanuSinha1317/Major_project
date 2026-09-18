package edu.institution.ims.mentor;

import edu.institution.ims.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/mentor/students")
public class MentorStudentController {
    private final MentorAssignmentService service;

    public MentorStudentController(MentorAssignmentService service) { this.service = service; }

    @GetMapping
    public List<AssignmentStudentResponse> assignedStudents(@AuthenticationPrincipal UserPrincipal principal) {
        return service.assignedTo(principal);
    }
}
