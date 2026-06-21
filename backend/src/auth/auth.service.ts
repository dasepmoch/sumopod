import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto, RegisterDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) {}

    private sign(user: { id: number; email: string; role: string }) {
        return this.jwt.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
        })
    }

    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        })
        if (existing) {
            throw new ConflictException('Email already registered')
        }
        const hash = await bcrypt.hash(dto.password, 10)
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hash,
            },
            select: { id: true, name: true, email: true, role: true },
        })
        return { user, accessToken: this.sign(user) }
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        })
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials')
        }
        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
        return { user: safeUser, accessToken: this.sign(safeUser) }
    }

    async me(userId: number) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true },
        })
    }
}
