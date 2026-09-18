package edu.institution.ims.attendance;

import edu.institution.ims.security.UserPrincipal;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/student/attendance")
public class StudentAttendanceController {
    private final AttendanceService service;

    public StudentAttendanceController(AttendanceService service) { this.service = service; }

    @PostMapping("/today")
    public ResponseEntity<AttendanceResponse> submitToday(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.submitToday(principal));
    }

    @GetMapping("/today")
    public TodayAttendanceResponse today(@AuthenticationPrincipal UserPrincipal principal) {
        return service.today(principal);
    }

    @GetMapping
    public List<AttendanceResponse> history(@AuthenticationPrincipal UserPrincipal principal) {
        return service.history(principal);
    }
}
