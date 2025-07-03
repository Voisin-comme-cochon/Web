import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiTags,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiBadRequestResponse,
} from '@nestjs/swagger';
import { DecodedToken } from '../../auth/domain/auth.model';
import { IsLoginGuard } from '../../../middleware/is-login.middleware';
import { LoanRequestsService } from '../services/loan-requests.service';
import { LoansService } from '../services/loans.service';
import { CreateLoanRequestDto, GetLoanRequestByIdDto, ResponseLoanRequestDto } from './dto/loan-requests.dto';
import { ReturnLoanDto, GetLoanByIdDto, ResponseLoanDto } from './dto/loans.dto';
import { GetItemByIdDto } from './dto/items.dto';

@ApiTags('loans')
@Controller()
@ApiBearerAuth()
@UseGuards(IsLoginGuard)
export class LoansController {
    constructor(
        private readonly loanRequestsService: LoanRequestsService,
        private readonly loansService: LoansService
    ) {}

    @Post('items/:id/loan-requests')
    @ApiOperation({ summary: 'Create a loan request for an item' })
    @ApiCreatedResponse({ description: 'Loan request created', type: ResponseLoanRequestDto })
    @ApiNotFoundResponse({ description: 'Item not found' })
    @ApiBadRequestResponse({ description: 'Invalid request or cannot borrow own item' })
    @ApiForbiddenResponse({ description: 'Not in same neighborhood' })
    async createLoanRequest(
        @Param() params: GetItemByIdDto,
        @Body() createLoanRequestDto: CreateLoanRequestDto,
        @Request() req: { user: DecodedToken }
    ): Promise<ResponseLoanRequestDto> {
        const borrowerId = req.user.id;
        return await this.loanRequestsService.createLoanRequest(
            params.id,
            {
                start_date: new Date(createLoanRequestDto.start_date),
                end_date: new Date(createLoanRequestDto.end_date),
                message: createLoanRequestDto.message,
            },
            borrowerId
        );
    }

    @Get('loan-requests/my-requests')
    @ApiOperation({ summary: 'Get my loan requests' })
    @ApiOkResponse({ description: 'Loan requests found', type: [ResponseLoanRequestDto] })
    async getMyLoanRequests(@Request() req: { user: DecodedToken }): Promise<ResponseLoanRequestDto[]> {
        const borrowerId = req.user.id;
        return await this.loanRequestsService.getLoanRequestsByBorrower(borrowerId, borrowerId);
    }

    @Get('loan-requests/received')
    @ApiOperation({ summary: 'Get loan requests for my items' })
    @ApiOkResponse({ description: 'Loan requests found', type: [ResponseLoanRequestDto] })
    async getReceivedLoanRequests(@Request() req: { user: DecodedToken }): Promise<ResponseLoanRequestDto[]> {
        const ownerId = req.user.id;
        return await this.loanRequestsService.getLoanRequestsByOwner(ownerId, ownerId);
    }

    @Get('loan-requests/:id')
    @ApiOperation({ summary: 'Get loan request by ID' })
    @ApiOkResponse({ description: 'Loan request found', type: ResponseLoanRequestDto })
    @ApiNotFoundResponse({ description: 'Loan request not found' })
    @ApiForbiddenResponse({ description: 'Access denied to this loan request' })
    async getLoanRequestById(
        @Param() params: GetLoanRequestByIdDto,
        @Request() req: { user: DecodedToken }
    ): Promise<ResponseLoanRequestDto> {
        const userId = req.user.id;
        return await this.loanRequestsService.getLoanRequestById(params.id, userId);
    }

    @Put('loan-requests/:id/accept')
    @ApiOperation({ summary: 'Accept a loan request' })
    @ApiOkResponse({ description: 'Loan request accepted' })
    @ApiNotFoundResponse({ description: 'Loan request not found' })
    @ApiForbiddenResponse({ description: 'You can only accept requests for your own items' })
    @ApiBadRequestResponse({ description: 'Request is not pending or item no longer available' })
    async acceptLoanRequest(
        @Param() params: GetLoanRequestByIdDto,
        @Request() req: { user: DecodedToken }
    ): Promise<{ success: boolean }> {
        const ownerId = req.user.id;
        await this.loanRequestsService.acceptLoanRequest(params.id, ownerId);
        return {
            success: true,
        };
    }

    @Put('loan-requests/:id/reject')
    @ApiOperation({ summary: 'Reject a loan request' })
    @ApiOkResponse({ description: 'Loan request rejected' })
    @ApiNotFoundResponse({ description: 'Loan request not found' })
    @ApiForbiddenResponse({ description: 'You can only reject requests for your own items' })
    @ApiBadRequestResponse({ description: 'Request is not pending' })
    async rejectLoanRequest(
        @Param() params: GetLoanRequestByIdDto,
        @Request() req: { user: DecodedToken }
    ): Promise<{ success: boolean }> {
        const ownerId = req.user.id;
        await this.loanRequestsService.rejectLoanRequest(params.id, ownerId);
        return {
            success: true,
        };
    }

    @Put('loan-requests/:id/cancel')
    @ApiOperation({ summary: 'Cancel a loan request' })
    @ApiOkResponse({ description: 'Loan request cancelled' })
    @ApiNotFoundResponse({ description: 'Loan request not found' })
    @ApiForbiddenResponse({ description: 'You can only cancel your own requests' })
    @ApiBadRequestResponse({ description: 'Request is not pending' })
    async cancelLoanRequest(
        @Param() params: GetLoanRequestByIdDto,
        @Request() req: { user: DecodedToken }
    ): Promise<{ success: boolean }> {
        const borrowerId = req.user.id;
        await this.loanRequestsService.cancelLoanRequest(params.id, borrowerId);
        return {
            success: true,
        };
    }

    @Get('loans/my-loans')
    @ApiOperation({ summary: 'Get my loans (as borrower)' })
    @ApiOkResponse({ description: 'Loans found', type: [ResponseLoanDto] })
    async getMyLoans(@Request() req: { user: DecodedToken }): Promise<ResponseLoanDto[]> {
        const borrowerId = req.user.id;
        return await this.loansService.getLoansByBorrower(borrowerId, borrowerId);
    }

    @Get('loans/lent-items')
    @ApiOperation({ summary: 'Get loans for my items (as owner)' })
    @ApiOkResponse({ description: 'Loans found', type: [ResponseLoanDto] })
    async getLentItems(@Request() req: { user: DecodedToken }): Promise<ResponseLoanDto[]> {
        const ownerId = req.user.id;
        return await this.loansService.getLoansByOwner(ownerId, ownerId);
    }

    @Get('loans/overdue')
    @ApiOperation({ summary: 'Get my overdue loans' })
    @ApiOkResponse({ description: 'Overdue loans found', type: [ResponseLoanDto] })
    async getOverdueLoans(@Request() req: { user: DecodedToken }): Promise<ResponseLoanDto[]> {
        const userId = req.user.id;
        return await this.loansService.getOverdueLoans(userId);
    }

    @Get('loans/:id')
    @ApiOperation({ summary: 'Get loan by ID' })
    @ApiOkResponse({ description: 'Loan found', type: ResponseLoanDto })
    @ApiNotFoundResponse({ description: 'Loan not found' })
    @ApiForbiddenResponse({ description: 'Access denied to this loan' })
    async getLoanById(
        @Param() params: GetLoanByIdDto,
        @Request() req: { user: DecodedToken }
    ): Promise<ResponseLoanDto> {
        const userId = req.user.id;
        return await this.loansService.getLoanById(params.id, userId);
    }

    @Put('loans/:id/return')
    @ApiOperation({ summary: 'Mark loan as returned' })
    @ApiOkResponse({ description: 'Loan returned' })
    @ApiNotFoundResponse({ description: 'Loan not found' })
    @ApiForbiddenResponse({ description: 'You can only return loans for items you borrowed or own' })
    @ApiBadRequestResponse({ description: 'Loan is not active' })
    async returnLoan(
        @Param() params: GetLoanByIdDto,
        @Body() returnLoanDto: ReturnLoanDto,
        @Request() req: { user: DecodedToken }
    ): Promise<{ success: boolean }> {
        const userId = req.user.id;
        const returnDate = returnLoanDto.actual_return_date ? new Date(returnLoanDto.actual_return_date) : undefined;
        await this.loansService.returnLoan(params.id, userId, returnDate);
        return {
            success: true,
        };
    }
}
