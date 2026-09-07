export interface paths {
    "/api/mobile/v1/amenities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileAmenityController_listAmenities"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/amenities/bookings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileAmenityController_listMyBookings"];
        put?: never;
        post: operations["MobileAmenityController_createBooking"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/amenities/bookings/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileAmenityController_cancelBooking"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/auth/otp/request": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileAuthController_requestOtp"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/auth/otp/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileAuthController_verifyOtp"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/auth/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileAuthController_password"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/bills": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileBillController_listBills"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/bills/{billId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileBillController_getBill"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/bills/{billId}/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileBillController_getBillPayments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/documents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileDocumentController_listDocuments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileEventController_listEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/events/rsvp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileEventController_rsvp"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/forum/threads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileForumController_listThreads"];
        put?: never;
        post: operations["MobileForumController_createThread"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/forum/threads/{threadId}/replies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileForumController_listReplies"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/forum/threads/reply": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileForumController_replyThread"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/guard/gate/overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileGuardController_overview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/guard/packages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileGuardController_listPackages"];
        put?: never;
        post: operations["MobileGuardController_intakePackage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/guard/packages/{packageId}/collect": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileGuardController_collectPackage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/guard/packages/{packageId}/notify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileGuardController_notifyPackage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/guard/packages/{packageId}/transition": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileGuardController_transitionPackage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/guard/visitors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileGuardController_listVisitors"];
        put?: never;
        post: operations["MobileGuardController_requestVisitor"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/guard/visitors/{visitorId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileGuardController_getVisitor"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/guard/visitors/{visitorId}/check-in": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileGuardController_checkIn"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/guard/visitors/{visitorId}/check-out": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileGuardController_checkOut"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/guard/visitors/{visitorId}/verify-passcode": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileGuardController_verifyPasscode"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/guard/visitors/passcode/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileGuardController_verifyPasscodeLookup"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/helpdesk": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileHelpdeskController_listComplaints"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/helpdesk/{complaintId}/rate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileHelpdeskController_rateComplaint"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/helpdesk/{complaintId}/transition": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileHelpdeskController_transitionComplaint"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/helpdesk/raise": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileHelpdeskController_raiseComplaint"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/marketplace/listings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileMarketplaceController_listListings"];
        put?: never;
        post: operations["MobileMarketplaceController_createListing"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/marketplace/listings/interest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileMarketplaceController_expressInterest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/marketplace/listings/transition": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileMarketplaceController_transitionListing"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/notices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileNoticeController_listNotices"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/notices/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileNoticeController_markRead"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/notices/unread-count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileNoticeController_unreadCount"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileNotificationController_listNotifications"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/notifications/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileNotificationController_markRead"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/notifications/register-push": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileNotificationController_registerPushToken"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/polls": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobilePollController_listPolls"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/polls/vote": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobilePollController_vote"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileProfileController_getProfile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/profile/update": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileProfileController_updateProfile"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/resident/packages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileResidentController_listPackages"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/resident/visitors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileResidentController_listVisitors"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/resident/visitors/{visitorId}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileResidentController_approveVisitor"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/resident/visitors/{visitorId}/reject": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileResidentController_rejectVisitor"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/session/active-role": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["MobileSessionController_activeRole"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/session/bootstrap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MobileSessionController_bootstrap"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/session/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileSessionController_logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/session/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileSessionController_refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/mobile/v1/sos/raise": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["MobileSosController_raiseSos"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        CancelBookingBodyDto: {
            bookingId: string;
        };
        CreateBookingBodyDto: {
            amenityId: string;
            date: string;
            startTime: string;
            endTime: string;
            purpose?: string;
        };
        CreateListingBodyDto: {
            title: string;
            description?: string;
            price?: number;
            /** @enum {string} */
            category?: "furniture" | "electronics" | "appliances" | "clothing" | "books" | "vehicles" | "services" | "general";
            /** @enum {string} */
            condition?: "new" | "like_new" | "good" | "fair" | "poor";
            contactPhone?: string;
        };
        CreateThreadBodyDto: {
            title: string;
            content: string;
            /** @enum {string} */
            category?: "general" | "maintenance" | "security" | "events" | "buy-sell" | "lost-found";
        };
        ExpressInterestBodyDto: {
            listingId: string;
            message?: string;
        };
        IntakePackageDto: {
            /** @example A-308 */
            flatQuery: string;
            /** @example Amazon */
            courierName?: string;
            /** @example Large box */
            description?: string;
            /** @example https://cdn.example.com/photo.jpg */
            photoUrl?: string;
        };
        LogoutMobileSessionDto: {
            renewableCredential: string;
        };
        LogoutMobileSessionResponseDto: {
            /** @enum {boolean} */
            loggedOut: true;
        };
        MarkNoticeReadBodyDto: {
            noticeId: string;
        };
        MarkNotificationReadBodyDto: {
            notificationId: string;
        };
        MobileAmenityBookingDto: {
            id: string;
            amenityId: string;
            amenityName: string;
            date: string;
            startTime: string;
            endTime: string;
            purpose?: string | null;
            /** @enum {string} */
            status: "confirmed" | "cancelled" | "pending";
            amount: number;
            flatNumber: string;
            createdAt: string;
        };
        MobileAmenityBookingListDto: {
            bookings: components["schemas"]["MobileAmenityBookingDto"][];
        };
        MobileAmenityBookingResultDto: {
            created: boolean;
            bookingId: string;
            /** @enum {string} */
            status: "confirmed" | "cancelled" | "pending";
            amount: number;
        };
        MobileAmenityDto: {
            id: string;
            name: string;
            category: string;
            description?: string | null;
            capacity?: number | null;
            ratePerHour: number;
            status: string;
            rules?: string | null;
        };
        MobileAmenityListDto: {
            amenities: components["schemas"]["MobileAmenityDto"][];
        };
        MobileAmenityProblemDto: {
            /** @enum {string} */
            code: "amenity_not_found" | "booking_not_found" | "booking_already_cancelled";
            message: string;
            requestId?: string;
        };
        MobileBillDto: {
            id: string;
            amount: number;
            /** @enum {string} */
            billType: "maintenance" | "annual" | "sinking" | "repair" | "parking" | "other";
            period: string;
            dueDate: string;
            /** @enum {string} */
            status: "pending" | "partial" | "paid";
            lateFee: number;
            gstAmount: number;
            totalAmount?: number | null;
            description?: string | null;
            paidAt?: string | null;
            paidVia?: string | null;
            paidAmount?: number | null;
            receiptNumber?: string | null;
            flatNumber: string;
            createdAt: string;
        };
        MobileBillListDto: {
            bills: components["schemas"]["MobileBillDto"][];
            totalPending: number;
            totalAmount: number;
        };
        MobileBillPaymentDto: {
            id: string;
            amount: number;
            method: string;
            reference?: string | null;
            status: string;
            paidAt: string;
            receiptNumber?: string | null;
        };
        MobileBillPaymentsDto: {
            payments: components["schemas"]["MobileBillPaymentDto"][];
        };
        MobileBillProblemDto: {
            /** @enum {string} */
            code: "bill_not_found" | "flat_not_linked";
            message: string;
            requestId?: string;
        };
        MobileBootstrapDto: {
            user: components["schemas"]["MobileBootstrapUserDto"];
            society: components["schemas"]["MobileBootstrapSocietyDto"];
            approvedRoles: ("resident" | "guard")[];
            /** @enum {string} */
            activeRole: "resident" | "guard";
            permissions: string[];
            featureFlags: components["schemas"]["MobileFeatureFlagsDto"];
            notificationPolicy: components["schemas"]["MobileNotificationPolicyDto"];
        };
        MobileBootstrapSocietyDto: {
            id: string;
            name: string;
        };
        MobileBootstrapUserDto: {
            id: string;
            name: string;
            /** Format: email */
            email: string;
        };
        MobileCommunityNotificationPolicyDto: {
            /** @enum {boolean} */
            enabled: false;
            /** @enum {boolean} */
            configurable: true;
        };
        MobileCriticalNotificationPolicyDto: {
            /** @enum {boolean} */
            enabled: true;
            /** @enum {boolean} */
            configurable: false;
        };
        MobileDocumentDto: {
            id: string;
            title: string;
            category: string;
            fileName: string;
            fileUrl: string;
            fileSize?: number | null;
            uploadedBy: string;
            createdAt: string;
        };
        MobileDocumentListDto: {
            documents: components["schemas"]["MobileDocumentDto"][];
        };
        MobileDocumentProblemDto: {
            /** @enum {string} */
            code: never;
            message: string;
            requestId?: string;
        };
        MobileEventDto: {
            id: string;
            title: string;
            description?: string | null;
            startDate: string;
            endDate?: string | null;
            venue?: string | null;
            /** @enum {string} */
            category: "general" | "festival" | "meeting" | "sports" | "cultural" | "maintenance";
            maxAttendees?: number | null;
            /** @enum {string} */
            status: "upcoming" | "ongoing" | "completed" | "cancelled";
            rsvpCount: number;
            myResponse?: string | null;
            createdAt: string;
        };
        MobileEventListDto: {
            events: components["schemas"]["MobileEventDto"][];
        };
        MobileEventProblemDto: {
            /** @enum {string} */
            code: "event_not_found" | "event_not_open" | "event_full";
            message: string;
            requestId?: string;
        };
        MobileFeatureFlagsDto: {
            /** @enum {boolean} */
            residentShell: true;
            /** @enum {boolean} */
            guardShell: true;
            /** @enum {boolean} */
            nativePush: false;
            /** @enum {boolean} */
            guardOffline: false;
        };
        MobileForumCreateThreadResultDto: {
            /** @enum {boolean} */
            created: true;
            threadId: string;
        };
        MobileForumProblemDto: {
            /** @enum {string} */
            code: "thread_not_found" | "thread_locked";
            message: string;
            requestId?: string;
        };
        MobileForumReplyDto: {
            id: string;
            content: string;
            authorId: string;
            createdAt: string;
        };
        MobileForumReplyListDto: {
            replies: components["schemas"]["MobileForumReplyDto"][];
        };
        MobileForumReplyThreadResultDto: {
            /** @enum {boolean} */
            replied: true;
            replyId: string;
        };
        MobileForumThreadDto: {
            id: string;
            title: string;
            content: string;
            /** @enum {string} */
            category: "general" | "maintenance" | "security" | "events" | "buy-sell" | "lost-found";
            isPinned: boolean;
            isLocked: boolean;
            views: number;
            replyCount: number;
            authorId: string;
            lastActivityAt: string;
            createdAt: string;
        };
        MobileForumThreadListDto: {
            threads: components["schemas"]["MobileForumThreadDto"][];
        };
        MobileGuardOverviewCountsDto: {
            inside: number;
            expected: number;
            pendingApproval: number;
            pendingParcels: number;
        };
        MobileGuardOverviewDto: {
            gateLabel: string;
            counts: components["schemas"]["MobileGuardOverviewCountsDto"];
        };
        MobileGuardPackageDto: {
            id: string;
            flatNumber: string;
            courierName?: string | null;
            description?: string | null;
            photoUrl?: string | null;
            /** @enum {string} */
            status: "received" | "notified" | "collected" | "returned" | "lost";
            pickupOtp?: string | null;
            receivedAt: string;
            notifiedAt?: string | null;
            collectedAt?: string | null;
            collectedBy?: string | null;
        };
        MobileGuardPasscodeResultDto: {
            id: string;
            passcodeVerified: boolean;
        };
        MobileGuardProblemDto: {
            /** @enum {string} */
            code: "flat_not_found" | "visitor_not_found" | "visitor_not_approved" | "visitor_not_inside" | "visitor_blacklisted" | "invalid_visitor_passcode" | "passcode_verification_required" | "package_not_found" | "invalid_package_otp" | "package_already_finalized";
            message: string;
            requestId?: string;
        };
        MobileGuardVisitorDto: {
            id: string;
            flatNumber: string;
            visitorName: string;
            purpose: string;
            /** @enum {string} */
            status: "expected" | "inside" | "exited" | "rejected" | "cancelled";
            /** @description Whether the visitor must verify a stored passcode before check-in. */
            passcodeRequired: boolean;
            residentResponse?: string | null;
            phone?: string | null;
            vehicleNo?: string | null;
            arrivedAt: string;
            entryTime?: string | null;
            exitTime?: string | null;
        };
        MobileHelpdeskComplaintDto: {
            id: string;
            title: string;
            description: string;
            /** @enum {string} */
            category: "plumbing" | "electrical" | "cleanliness" | "security" | "parking" | "general";
            /** @enum {string} */
            priority: "low" | "medium" | "high" | "urgent";
            /** @enum {string} */
            status: "open" | "in_progress" | "resolved" | "closed";
            flatNumber: string;
            raisedBy: string;
            resolution?: string | null;
            resolvedAt?: string | null;
            assignedTo?: string | null;
            escalationLevel: number;
            satisfactionRating?: number | null;
            createdAt: string;
            slaDueAt?: string | null;
            slaBreached: boolean;
        };
        MobileHelpdeskListDto: {
            complaints: components["schemas"]["MobileHelpdeskComplaintDto"][];
        };
        MobileHelpdeskProblemDto: {
            /** @enum {string} */
            code: "complaint_not_found" | "complaint_not_resolved" | "invalid_transition";
            message: string;
            requestId?: string;
        };
        MobileHelpdeskRaiseResultDto: {
            created: boolean;
            complaintId: string;
            /** @enum {string} */
            status: "open" | "in_progress" | "resolved" | "closed";
            /** @enum {string} */
            priority: "low" | "medium" | "high" | "urgent";
            slaDueAt: string;
        };
        MobileHelpdeskRateResultDto: {
            rated: boolean;
            complaintId: string;
            rating: number;
        };
        MobileHelpdeskTransitionResultDto: {
            transitioned: boolean;
            complaintId: string;
            /** @enum {string} */
            status: "open" | "in_progress" | "resolved" | "closed";
        };
        MobileInstallationDto: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            platform: "android" | "ios";
            /** @example 1.0.0 */
            appVersion: string;
            /** @example Pixel 9 */
            deviceName?: string;
        };
        MobileMarketplaceCreateResultDto: {
            created: boolean;
            listingId: string;
        };
        MobileMarketplaceInterestResultDto: {
            interested: boolean;
            listingId: string;
        };
        MobileMarketplaceListDto: {
            listings: components["schemas"]["MobileMarketplaceListingDto"][];
        };
        MobileMarketplaceListingDto: {
            id: string;
            title: string;
            description?: string | null;
            price?: number | null;
            /** @enum {string} */
            category: "furniture" | "electronics" | "appliances" | "clothing" | "books" | "vehicles" | "services" | "general";
            /** @enum {string} */
            condition: "new" | "like_new" | "good" | "fair" | "poor";
            /** @enum {string} */
            status: "active" | "sold" | "reserved" | "expired";
            imageUrls?: string[] | null;
            contactPhone?: string | null;
            flatNumber?: string | null;
            userId: string;
            createdAt: string;
        };
        MobileMarketplaceProblemDto: {
            /** @enum {string} */
            code: "listing_not_found" | "not_owner";
            message: string;
            requestId?: string;
        };
        MobileNoticeDto: {
            id: string;
            title: string;
            body: string;
            /** @enum {string} */
            category: "general" | "event" | "maintenance" | "emergency" | "meeting";
            postedBy: string;
            isPinned: boolean;
            expiresAt?: string | null;
            createdAt: string;
            isRead: boolean;
        };
        MobileNoticeListDto: {
            notices: components["schemas"]["MobileNoticeDto"][];
            unreadCount: number;
        };
        MobileNoticeMarkReadDto: {
            acknowledged: boolean;
            replayed: boolean;
            noticeId: string;
        };
        MobileNoticeProblemDto: {
            /** @enum {string} */
            code: "notice_not_found";
            message: string;
            requestId?: string;
        };
        MobileNotificationDto: {
            id: string;
            type: string;
            title: string;
            message: string;
            link?: string | null;
            isRead: boolean;
            createdAt: string;
        };
        MobileNotificationListDto: {
            notifications: components["schemas"]["MobileNotificationDto"][];
            unreadCount: number;
        };
        MobileNotificationMarkReadResultDto: {
            acknowledged: boolean;
            replayed: boolean;
            notificationId: string;
        };
        MobileNotificationPolicyDto: {
            critical: components["schemas"]["MobileCriticalNotificationPolicyDto"];
            transactional: components["schemas"]["MobileTransactionalNotificationPolicyDto"];
            community: components["schemas"]["MobileCommunityNotificationPolicyDto"];
        };
        MobileNotificationRegisterResultDto: {
            registered: boolean;
            endpoint: string;
        };
        MobilePollDto: {
            id: string;
            title: string;
            description?: string | null;
            options: components["schemas"]["MobilePollOptionDto"][];
            totalVotes: number;
            /** @enum {string} */
            status: "active" | "closed";
            closesAt?: string | null;
            hasVoted: boolean;
            createdBy: string;
            createdAt: string;
        };
        MobilePollListDto: {
            polls: components["schemas"]["MobilePollDto"][];
        };
        MobilePollOptionDto: {
            index: number;
            option: string;
            count: number;
        };
        MobilePollProblemDto: {
            /** @enum {string} */
            code: "poll_not_found" | "poll_not_open" | "invalid_option";
            message: string;
            requestId?: string;
        };
        MobileProfileDto: {
            userId: string;
            name: string;
            email: string;
            phone?: string | null;
            role: string;
            societyId: string;
            societyName: string;
            flatNumber?: string | null;
            showPhoneInDirectory: boolean;
            showEmailInDirectory: boolean;
            profilePhoto?: string | null;
            emergencyContact?: string | null;
        };
        MobileProfileUpdateResultDto: {
            updated: boolean;
        };
        MobileResidentPackageDto: {
            id: string;
            courierName?: string | null;
            description?: string | null;
            photoUrl?: string | null;
            /** @enum {string} */
            status: "received" | "notified" | "collected" | "returned" | "lost";
            pickupOtp?: string | null;
            receivedAt: string;
            notifiedAt?: string | null;
            collectedAt?: string | null;
        };
        MobileResidentPackagesDto: {
            flatNumber?: string | null;
            packages: components["schemas"]["MobileResidentPackageDto"][];
        };
        MobileResidentProblemDto: {
            code: string;
            message: string;
            requestId?: string;
        };
        MobileResidentVisitorDto: {
            id: string;
            visitorName: string;
            purpose: string;
            /** @enum {string} */
            status: "pending" | "approved" | "inside" | "exited" | "rejected" | "cancelled";
            phone?: string | null;
            vehicleNo?: string | null;
            passcode?: string | null;
            arrivedAt?: string | null;
            expectedAt?: string | null;
            entryTime?: string | null;
            exitTime?: string | null;
            createdAt: string;
        };
        MobileResidentVisitorsDto: {
            flatNumber?: string | null;
            visitors: components["schemas"]["MobileResidentVisitorDto"][];
        };
        MobileRoleSwitchDto: {
            accessToken: string;
            /** Format: date-time */
            accessExpiresAt: string;
            bootstrap: components["schemas"]["MobileBootstrapDto"];
        };
        MobileRsvpResultDto: {
            rsvp: boolean;
            replayed: boolean;
            eventId: string;
            /** @enum {string} */
            response: "attending" | "maybe" | "declined";
        };
        MobileSessionIssueDto: {
            accessToken: string;
            /** Format: date-time */
            accessExpiresAt: string;
            renewableCredential: string;
            /** Format: date-time */
            renewableExpiresAt: string;
            deviceSessionId: string;
            /** @enum {string} */
            activeRole: "resident" | "guard";
        };
        MobileSosProblemDto: {
            /** @enum {string} */
            code: never;
            message: string;
            requestId?: string;
        };
        MobileSosResultDto: {
            incidentId: string;
            /** @enum {string} */
            severity: "low" | "medium" | "high" | "critical";
            acknowledgementRequired: boolean;
            notificationsSent: number;
        };
        MobileTransactionalNotificationPolicyDto: {
            /** @enum {boolean} */
            enabled: true;
            /** @enum {boolean} */
            configurable: true;
        };
        MobileVoteResultDto: {
            voted: boolean;
            replayed: boolean;
            pollId: string;
            optionIndex: number;
        };
        OtpRequestAcceptedDto: {
            accepted: boolean;
            /** Format: uuid */
            challengeId: string;
        };
        OtpRequestDto: {
            /** Format: email */
            identifier: string;
            installation: components["schemas"]["MobileInstallationDto"];
        };
        OtpVerifyDto: {
            /** Format: uuid */
            challengeId: string;
            code: string;
            installation: components["schemas"]["MobileInstallationDto"];
        };
        PackageTransitionDto: {
            /**
             * @example return
             * @enum {string}
             */
            action: "return" | "mark_lost";
        };
        PasswordLoginRequestDto: {
            /** Format: email */
            identifier: string;
            password: string;
            installation: components["schemas"]["MobileInstallationDto"];
        };
        RaiseComplaintBodyDto: {
            title: string;
            description: string;
            /** @enum {string} */
            category?: "plumbing" | "electrical" | "cleanliness" | "security" | "parking" | "general";
            /** @enum {string} */
            priority?: "low" | "medium" | "high" | "urgent";
            mediaUrls?: string[];
        };
        RaiseMobileSosDto: {
            /** @example Medical emergency in Block A */
            description?: string;
            /**
             * @example critical
             * @enum {string}
             */
            severity?: "low" | "medium" | "high" | "critical";
        };
        RateComplaintBodyDto: {
            rating: number;
            comment?: string;
        };
        RefreshMobileSessionDto: {
            renewableCredential: string;
        };
        RegisterPushTokenBodyDto: {
            endpoint: string;
            p256dh: string;
            auth: string;
            userAgent?: string;
        };
        ReplyThreadBodyDto: {
            threadId: string;
            content: string;
        };
        RequestVisitorDto: {
            /** @example A-308 */
            flatQuery: string;
            /** @example Maya */
            visitorName: string;
            /** @example guest */
            purpose: string;
            /** @example +919876543210 */
            phone?: string;
            /** @example MH 12 AB 1234 */
            vehicleNo?: string;
            /** @example 4829 */
            passcode?: string;
        };
        RsvpBodyDto: {
            eventId: string;
            /** @enum {string} */
            response?: "attending" | "maybe" | "declined";
        };
        TransitionComplaintBodyDto: {
            /** @enum {string} */
            action: "start" | "resolve" | "close" | "reopen";
            resolution?: string;
        };
        TransitionListingBodyDto: {
            listingId: string;
            /** @enum {string} */
            action: "sold" | "reserved" | "active";
        };
        UpdateMobileActiveRoleDto: {
            /** @enum {string} */
            role: "resident" | "guard";
        };
        UpdateProfileBodyDto: {
            name?: string;
            phone?: string;
            emergencyContact?: string;
            showPhoneInDirectory?: boolean;
            showEmailInDirectory?: boolean;
        };
        VerifyPackagePickupDto: {
            /** @example 482913 */
            providedOtp: string;
            /** @example Priya Nair */
            collectedBy?: string;
        };
        VerifyVisitorPasscodeDto: {
            /** @example 4829 */
            passcode: string;
        };
        VoteBodyDto: {
            pollId: string;
            optionIndex: number;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    MobileAmenityController_listAmenities: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileAmenityListDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileAmenityProblemDto"];
                };
            };
        };
    };
    MobileAmenityController_listMyBookings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileAmenityBookingListDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileAmenityProblemDto"];
                };
            };
        };
    };
    MobileAmenityController_createBooking: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateBookingBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileAmenityBookingResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileAmenityProblemDto"];
                };
            };
        };
    };
    MobileAmenityController_cancelBooking: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CancelBookingBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileAmenityBookingResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileAmenityProblemDto"];
                };
            };
        };
    };
    MobileAuthController_requestOtp: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OtpRequestDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OtpRequestAcceptedDto"];
                };
            };
        };
    };
    MobileAuthController_verifyOtp: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OtpVerifyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileSessionIssueDto"];
                };
            };
        };
    };
    MobileAuthController_password: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordLoginRequestDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileSessionIssueDto"];
                };
            };
        };
    };
    MobileBillController_listBills: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileBillListDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileBillProblemDto"];
                };
            };
        };
    };
    MobileBillController_getBill: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                billId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileBillDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileBillProblemDto"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileBillProblemDto"];
                };
            };
        };
    };
    MobileBillController_getBillPayments: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                billId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileBillPaymentsDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileBillProblemDto"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileBillProblemDto"];
                };
            };
        };
    };
    MobileDocumentController_listDocuments: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileDocumentListDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileDocumentProblemDto"];
                };
            };
        };
    };
    MobileEventController_listEvents: {
        parameters: {
            query?: {
                status?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileEventListDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileEventProblemDto"];
                };
            };
        };
    };
    MobileEventController_rsvp: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RsvpBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileRsvpResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileEventProblemDto"];
                };
            };
        };
    };
    MobileForumController_listThreads: {
        parameters: {
            query?: {
                category?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileForumThreadListDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileForumProblemDto"];
                };
            };
        };
    };
    MobileForumController_createThread: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateThreadBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileForumCreateThreadResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileForumProblemDto"];
                };
            };
        };
    };
    MobileForumController_listReplies: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                threadId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileForumReplyListDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileForumProblemDto"];
                };
            };
        };
    };
    MobileForumController_replyThread: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReplyThreadBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileForumReplyThreadResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileForumProblemDto"];
                };
            };
        };
    };
    MobileGuardController_overview: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardOverviewDto"];
                };
            };
        };
    };
    MobileGuardController_listPackages: {
        parameters: {
            query?: {
                status?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardPackageDto"][];
                };
            };
        };
    };
    MobileGuardController_intakePackage: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["IntakePackageDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardPackageDto"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
        };
    };
    MobileGuardController_collectPackage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                packageId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyPackagePickupDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardPackageDto"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
        };
    };
    MobileGuardController_notifyPackage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                packageId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardPackageDto"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
        };
    };
    MobileGuardController_transitionPackage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                packageId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PackageTransitionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardPackageDto"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
        };
    };
    MobileGuardController_listVisitors: {
        parameters: {
            query?: {
                status?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardVisitorDto"][];
                };
            };
        };
    };
    MobileGuardController_requestVisitor: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestVisitorDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardVisitorDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
        };
    };
    MobileGuardController_getVisitor: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                visitorId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardVisitorDto"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
        };
    };
    MobileGuardController_checkIn: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                visitorId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardVisitorDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
        };
    };
    MobileGuardController_checkOut: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                visitorId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardVisitorDto"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
        };
    };
    MobileGuardController_verifyPasscode: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                visitorId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyVisitorPasscodeDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardPasscodeResultDto"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
        };
    };
    MobileGuardController_verifyPasscodeLookup: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyVisitorPasscodeDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardVisitorDto"];
                };
            };
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileGuardProblemDto"];
                };
            };
        };
    };
    MobileHelpdeskController_listComplaints: {
        parameters: {
            query?: {
                status?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileHelpdeskListDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileHelpdeskProblemDto"];
                };
            };
        };
    };
    MobileHelpdeskController_rateComplaint: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                complaintId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RateComplaintBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileHelpdeskRateResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileHelpdeskProblemDto"];
                };
            };
        };
    };
    MobileHelpdeskController_transitionComplaint: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                complaintId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TransitionComplaintBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileHelpdeskTransitionResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileHelpdeskProblemDto"];
                };
            };
        };
    };
    MobileHelpdeskController_raiseComplaint: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RaiseComplaintBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileHelpdeskRaiseResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileHelpdeskProblemDto"];
                };
            };
        };
    };
    MobileMarketplaceController_listListings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileMarketplaceListDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileMarketplaceProblemDto"];
                };
            };
        };
    };
    MobileMarketplaceController_createListing: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateListingBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileMarketplaceCreateResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileMarketplaceProblemDto"];
                };
            };
        };
    };
    MobileMarketplaceController_expressInterest: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExpressInterestBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileMarketplaceInterestResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileMarketplaceProblemDto"];
                };
            };
        };
    };
    MobileMarketplaceController_transitionListing: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TransitionListingBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileMarketplaceCreateResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileMarketplaceProblemDto"];
                };
            };
        };
    };
    MobileNoticeController_listNotices: {
        parameters: {
            query?: {
                activeOnly?: boolean;
                category?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileNoticeListDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileNoticeProblemDto"];
                };
            };
        };
    };
    MobileNoticeController_markRead: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MarkNoticeReadBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileNoticeMarkReadDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileNoticeProblemDto"];
                };
            };
        };
    };
    MobileNoticeController_unreadCount: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileNoticeListDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileNoticeProblemDto"];
                };
            };
        };
    };
    MobileNotificationController_listNotifications: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileNotificationListDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileNotificationDto"];
                };
            };
        };
    };
    MobileNotificationController_markRead: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MarkNotificationReadBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileNotificationMarkReadResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileNotificationDto"];
                };
            };
        };
    };
    MobileNotificationController_registerPushToken: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterPushTokenBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileNotificationRegisterResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileNotificationDto"];
                };
            };
        };
    };
    MobilePollController_listPolls: {
        parameters: {
            query?: {
                status?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobilePollListDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobilePollProblemDto"];
                };
            };
        };
    };
    MobilePollController_vote: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VoteBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileVoteResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobilePollProblemDto"];
                };
            };
        };
    };
    MobileProfileController_getProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileProfileDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileProfileDto"];
                };
            };
        };
    };
    MobileProfileController_updateProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProfileBodyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileProfileUpdateResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileProfileDto"];
                };
            };
        };
    };
    MobileResidentController_listPackages: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileResidentPackagesDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileResidentProblemDto"];
                };
            };
        };
    };
    MobileResidentController_listVisitors: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileResidentVisitorsDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileResidentProblemDto"];
                };
            };
        };
    };
    MobileResidentController_approveVisitor: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                visitorId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileResidentVisitorDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileResidentProblemDto"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileResidentProblemDto"];
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileResidentProblemDto"];
                };
            };
        };
    };
    MobileResidentController_rejectVisitor: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                visitorId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileResidentVisitorDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileResidentProblemDto"];
                };
            };
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileResidentProblemDto"];
                };
            };
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileResidentProblemDto"];
                };
            };
        };
    };
    MobileSessionController_activeRole: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateMobileActiveRoleDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileRoleSwitchDto"];
                };
            };
        };
    };
    MobileSessionController_bootstrap: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileBootstrapDto"];
                };
            };
        };
    };
    MobileSessionController_logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LogoutMobileSessionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LogoutMobileSessionResponseDto"];
                };
            };
        };
    };
    MobileSessionController_refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshMobileSessionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileSessionIssueDto"];
                };
            };
        };
    };
    MobileSosController_raiseSos: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RaiseMobileSosDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileSosResultDto"];
                };
            };
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileSosProblemDto"];
                };
            };
        };
    };
}
