import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerStaffSchema } from "@/lib/validations/auth";
import { UserRole } from "@sim/database";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerStaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { fullName, email, phone, password, role, unitId } = parsed.data;

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan gunakan email lain atau login." },
        { status: 400 }
      );
    }

    // Sign up with Better Auth
    const headers = new Headers(request.headers);
    const authData = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: fullName,
        fullName: fullName,
        phone: phone,
        isActive: true,
        passwordHash: "managed_by_better_auth",
        leaveQuota: 12,
        groups: [],
      },
      headers
    });

    if (!authData || !authData.user) {
      return NextResponse.json(
        { error: "Gagal membuat akun autentikasi." },
        { status: 400 }
      );
    }

    // Create role assignment in Prisma
    await prisma.userRoleAssignment.create({
      data: {
        userId: authData.user.id,
        role: role as UserRole,
        unitId: unitId,
      },
    });

    return NextResponse.json(
      { message: "Registrasi berhasil.", userId: authData.user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
