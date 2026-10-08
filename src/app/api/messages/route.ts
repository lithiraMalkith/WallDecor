import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { adminStore, initialMessages } from "@/lib/admin-data";
import { messageSchema } from "@/lib/validations";
import type { UserMessage } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let messages: UserMessage[] = [];

    if (adminDb) {
      try {
        const snap = await adminDb.collection("messages").get();
        if (!snap.empty) {
          messages = snap.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            } as UserMessage;
          });
        } else {
          // If Firestore collection is empty, seed initial messages
          try {
            const batch = adminDb.batch();
            for (const m of initialMessages) {
              const cleanM = Object.fromEntries(
                Object.entries(m).filter(([_, v]) => v !== undefined)
              );
              batch.set(adminDb.collection("messages").doc(m.id), cleanM);
            }
            await batch.commit();
            messages = [...initialMessages];
          } catch (seedErr) {
            console.warn("Seeding initial messages failed:", seedErr);
            messages = [...adminStore.messages];
          }
        }
      } catch (err) {
        console.warn("adminDb error in GET /api/messages:", err);
      }
    }

    if (messages.length === 0) {
      messages = [...adminStore.messages];
    } else {
      adminStore.messages = messages;
    }

    // Filter in-memory
    if (status && status !== "all") {
      messages = messages.filter((m) => m.status === status);
    }

    // Sort newest first
    messages.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const isEmail = data.contact.includes("@");
    const isPhone = !isEmail && /\d/.test(data.contact);

    const newMessage: UserMessage = {
      id: `msg_${Date.now()}`,
      name: data.name,
      contact: data.contact,
      email: data.email || (isEmail ? data.contact : undefined),
      phone: data.phone || (isPhone ? data.contact : undefined),
      subject: data.subject || "Storefront Inquiry",
      message: data.message,
      status: "unread",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (adminDb) {
      try {
        const cleanMessage = Object.fromEntries(
          Object.entries(newMessage).filter(([_, v]) => v !== undefined)
        );
        await adminDb.collection("messages").doc(newMessage.id).set(cleanMessage);
      } catch (err) {
        console.warn("adminDb write error in POST /api/messages:", err);
      }
    }

    adminStore.messages.unshift(newMessage);

    adminStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      userId: "usr_guest",
      userEmail: newMessage.email || newMessage.contact,
      userRole: "customer",
      action: "message:received",
      entityType: "message",
      entityId: newMessage.id,
      details: `New inquiry received from ${newMessage.name}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, data: newMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit message" },
      { status: 500 }
    );
  }
}
