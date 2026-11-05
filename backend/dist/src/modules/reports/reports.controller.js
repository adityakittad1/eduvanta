"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const prisma_1 = require("../../lib/prisma");
const supabase_1 = require("../../lib/supabase");
const authDb_1 = require("../../lib/authDb");
const errorHandler_1 = require("../../middleware/errorHandler");
async function getDashboardStats(req, res, next) {
    try {
        const schoolId = req.tenant.id;
        if (!schoolId)
            throw new errorHandler_1.AppError('No school context', 400, 'BAD_REQUEST');
        let studentCount = 0;
        let teacherCount = 0;
        let classCount = 0;
        let warningCount = 0;
        let todayAttendancePercentage = null;
        let todayPresentCount = 0;
        let todayAbsentCount = 0;
        let attendanceTrends = [];
        let recentNotices = [];
        let handledWithPrisma = false;
        if ((0, authDb_1.isPrismaAvailable)()) {
            try {
                [studentCount, teacherCount, classCount, warningCount] = await Promise.all([
                    prisma_1.prisma.student.count({ where: { schoolId, isActive: true } }),
                    prisma_1.prisma.teacher.count({ where: { schoolId, isActive: true } }),
                    prisma_1.prisma.class.count({ where: { schoolId, isActive: true } }),
                    prisma_1.prisma.earlyWarningFlag.count({ where: { schoolId, isResolved: false } }),
                ]);
                // Recent notices
                const notices = await prisma_1.prisma.notice.findMany({
                    where: { schoolId, status: 'PUBLISHED' },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        targetAudience: true,
                        status: true,
                        createdAt: true,
                    }
                });
                recentNotices = notices.map(n => ({
                    id: n.id,
                    title: n.title,
                    content: n.content,
                    targetAudience: n.targetAudience,
                    status: n.status,
                    createdAt: n.createdAt.toISOString(),
                }));
                // Recent attendance records
                const recentAtt = await prisma_1.prisma.attendanceRecord.findMany({
                    where: { schoolId },
                    orderBy: { date: 'desc' },
                    take: 500,
                    select: { date: true, status: true }
                });
                if (recentAtt.length > 0) {
                    const dateGroups = {};
                    for (const a of recentAtt) {
                        const dStr = a.date.toISOString().split('T')[0];
                        if (!dateGroups[dStr])
                            dateGroups[dStr] = { present: 0, absent: 0, total: 0 };
                        dateGroups[dStr].total++;
                        if (a.status === 'PRESENT' || a.status === 'LATE')
                            dateGroups[dStr].present++;
                        else if (a.status === 'ABSENT')
                            dateGroups[dStr].absent++;
                    }
                    const sortedDates = Object.keys(dateGroups).sort().reverse().slice(0, 7).reverse();
                    attendanceTrends = sortedDates.map(dStr => {
                        const g = dateGroups[dStr];
                        const pct = g.total > 0 ? Math.round((g.present / g.total) * 1000) / 10 : 0;
                        const dateObj = new Date(dStr);
                        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                        return {
                            date: dStr,
                            day: dayName,
                            percentage: pct,
                            present: g.present,
                            absent: g.absent,
                        };
                    });
                    const latestDateStr = sortedDates[sortedDates.length - 1];
                    if (latestDateStr && dateGroups[latestDateStr]) {
                        const latest = dateGroups[latestDateStr];
                        todayPresentCount = latest.present;
                        todayAbsentCount = latest.absent;
                        todayAttendancePercentage = latest.total > 0 ? Math.round((latest.present / latest.total) * 1000) / 10 : null;
                    }
                }
                handledWithPrisma = true;
            }
            catch (err) {
                (0, authDb_1.markPrismaFailure)();
            }
        }
        // Fallback to Supabase if Prisma is unavailable
        if (!handledWithPrisma && supabase_1.supabase) {
            const [stRes, tcRes, clRes, ewRes, notRes, attRes] = await Promise.all([
                supabase_1.supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
                supabase_1.supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
                supabase_1.supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
                supabase_1.supabase.from('early_warning_flags').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_resolved', false),
                supabase_1.supabase.from('notices').select('id, title, content, target_audience, status, created_at').eq('school_id', schoolId).eq('status', 'PUBLISHED').order('created_at', { ascending: false }).limit(5),
                supabase_1.supabase.from('attendance_records').select('date, status').eq('school_id', schoolId).order('date', { ascending: false }).limit(500),
            ]);
            studentCount = stRes.count || 0;
            teacherCount = tcRes.count || 0;
            classCount = clRes.count || 0;
            warningCount = ewRes.count || 0;
            recentNotices = (notRes.data || []).map((n) => ({
                id: n.id,
                title: n.title,
                content: n.content,
                targetAudience: n.target_audience,
                status: n.status,
                createdAt: n.created_at,
            }));
            const attData = attRes.data || [];
            if (attData.length > 0) {
                const dateGroups = {};
                for (const a of attData) {
                    const dStr = typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0];
                    if (!dateGroups[dStr])
                        dateGroups[dStr] = { present: 0, absent: 0, total: 0 };
                    dateGroups[dStr].total++;
                    if (a.status === 'PRESENT' || a.status === 'LATE')
                        dateGroups[dStr].present++;
                    else if (a.status === 'ABSENT')
                        dateGroups[dStr].absent++;
                }
                const sortedDates = Object.keys(dateGroups).sort().reverse().slice(0, 7).reverse();
                attendanceTrends = sortedDates.map(dStr => {
                    const g = dateGroups[dStr];
                    const pct = g.total > 0 ? Math.round((g.present / g.total) * 1000) / 10 : 0;
                    const dateObj = new Date(dStr);
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    return {
                        date: dStr,
                        day: dayName,
                        percentage: pct,
                        present: g.present,
                        absent: g.absent,
                    };
                });
                const latestDateStr = sortedDates[sortedDates.length - 1];
                if (latestDateStr && dateGroups[latestDateStr]) {
                    const latest = dateGroups[latestDateStr];
                    todayPresentCount = latest.present;
                    todayAbsentCount = latest.absent;
                    todayAttendancePercentage = latest.total > 0 ? Math.round((latest.present / latest.total) * 1000) / 10 : null;
                }
            }
        }
        res.json({
            success: true,
            data: {
                studentCount,
                teacherCount,
                classCount,
                warningCount,
                todayAttendancePercentage,
                todayPresentCount,
                todayAbsentCount,
                attendanceTrends,
                recentNotices,
            }
        });
    }
    catch (error) {
        next(error);
    }
}
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=reports.controller.js.map