package edu.institution.ims.attendance;

import edu.institution.ims.security.UserPrincipal;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/student/attendance")
public class StudentAttendanceController {
    private final AttendanceService service;
    private final PhysicalAttendanceService physicalService;
    private final RemoteAttendanceService remoteService;
    private final AttendancePolicyService policyService;

    public StudentAttendanceController(AttendanceService service, PhysicalAttendanceService physicalService,
            RemoteAttendanceService remoteService, AttendancePolicyService policyService) {
        this.service = service;
        this.physicalService = physicalService;
        this.remoteService = remoteService;
        this.policyService = policyService;
    }

    @PostMapping("/today")
    public ResponseEntity<AttendanceResponse> submitToday(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.submitToday(principal));
    }

    @PostMapping(value = "/today/physical", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttendanceResponse> submitPhysicalToday(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @RequestParam(required = false) BigDecimal latitude,
            @RequestParam(required = false) BigDecimal longitude,
            @RequestParam(required = false) BigDecimal accuracy) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(physicalService.submitToday(principal, photo, latitude, longitude, accuracy));
    }

    @PostMapping(value = "/today/remote", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttendanceResponse> submitRemoteToday(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @RequestParam(required = false) String dailyWorkSummary) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(remoteService.submitToday(principal, photo, dailyWorkSummary));
    }

    @GetMapping("/today/policy")
    public AttendancePolicyResponse policy(@AuthenticationPrincipal UserPrincipal principal) {
        return policyService.today(principal);
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
